const {
  OPCUAClient,
  MessageSecurityMode,
  SecurityPolicy,
  AttributeIds,
  makeBrowsePath,
  ClientSubscription,
  TimestampsToReturn,
  MonitoringParametersOptions,
  ReadValueIdOptions,
  ClientMonitoredItem,
  ClientMonitoredItemGroup,
  DataValue
} = require("node-opcua");

const callbacks = [];
let instances = 0;
let client;
let session;
let subscription;
const applicationName = "OPCClient";

const connectionStrategy = {
  initialDelay: 1000,
  maxRetry: 1
};

//const endpointUrl = "opc.tcp://opcuademo.sterfive.com:26543";
// const endpointUrl = "opc.tcp://" + require("os").hostname() + ":4334/UA/MyLittleServer";

// async function timeout(ms) {
//   return new Promise(resolve => setTimeout(resolve, ms));
// }

class OPCClient {
  constructor(host, port, serverPath, messageSecurityMode, securityPolicy, callback) {
    if(callbacks) {
      callbacks.push(callback);
    }
    
    if(instances === 0) {
      console.debug(`instances: ${instances}`);

      client = OPCUAClient.create({
        applicationName: applicationName,
        connectionStrategy: connectionStrategy,
        securityMode: MessageSecurityMode.None,
        securityPolicy: SecurityPolicy.None,
        endpointMustExist: false
      });

      this.host = host;
      this.port = port;
      this.serverPath = serverPath;
      this.endpointUrl = `opc.tcp://${this.host}:${this.port}${this.serverPath}`;

      instances++;
    }
  }

  async connect() {
    console.log('connecting to ', this.endpointUrl);
    await client.connect(this.endpointUrl);
    console.log(`${applicationName} connected to ${this.host} on port ${this.port} using path ${this.serverPath} !`);

    session = await client.createSession();
    console.log("session created !");
  }

  async disconnect() {
    await session.close();
    await client.disconnect();
    console.log("disconnected !");
  }

  async readData(nodeId, attributeId) {
    const maxAge = 0;
    const nodeToRead = {
      nodeId: nodeId,
      attributeId: attributeId
    };
    const dataValue = await session.read(nodeToRead, maxAge);
    
    return dataValue.value.value;
  }

  async findNodeId(pathString) {
    let res = null;

    const browsePath = makeBrowsePath(
      "RootFolder",
      pathString
    );

    const result = await session.translateBrowsePath(browsePath);
    if(result.targets != null) {
      const nodeIdName = result.targets[0].targetId;
      res = nodeIdName.toString();
    }

    return res;
  }

  subscribe(itemsToMonitor) {
    subscription = ClientSubscription.create(session, {
      requestedPublishingInterval: 1000,
      requestedLifetimeCount: 100,
      requestedMaxKeepAliveCount: 10,
      maxNotificationsPerPublish: 100,
      publishingEnabled: true,
      priority: 10
    });
  
    subscription
    .on("started", function() {
      console.log(
        "subscription started - subscriptionId=",
        subscription.subscriptionId
      );
    })
    .on("keepalive", function() {
      console.log("subscription keepalive");
    })
    .on("terminated", function() {
      console.log("subscription terminated");
    });

    const parameters = {
      samplingInterval: 100,
      discardOldest: true,
      queueSize: 10
    };

    const monitoredItem = ClientMonitoredItemGroup.create(
      subscription,
      itemsToMonitor,
      parameters,
      TimestampsToReturn.Both
    );
    
    monitoredItem.on("changed", (monitoredItem, dataValue, index) => {
      console.log(` monitoredItem value has changed for #${index}: ${dataValue.value.value}`);

      for(const cbf of callbacks) {
        cbf(dataValue.value.value, index);
      }
    });
  }

  async unsubscribe() {
    await subscription.terminate();
  }
}

module.exports = OPCClient;