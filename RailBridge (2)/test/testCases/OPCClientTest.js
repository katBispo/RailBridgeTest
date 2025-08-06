"use strict";

const {
  MessageSecurityMode,
  SecurityPolicy,
  AttributeIds,
} = require("node-opcua");

const OPCClient = require('../../src/communication/channel/OPCClient');

const eventListener = (data, index) => {
  console.log('Callback: ', data, index);
}

async function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  try {
    const opcClient = new OPCClient(require("os").hostname(), 
    4334, '/UA/MyLittleServer', 
    MessageSecurityMode.None,
    SecurityPolicy.None, eventListener);
  
    await opcClient.connect();
  
    const itemsToMonitor = [
      {
          attributeId: AttributeIds.Value,
          nodeId: "ns=1;s=free_memory"
      },
      {
        attributeId: AttributeIds.Value,
        nodeId: "ns=1;b=1020FFAA"
      }
    ];
  
    opcClient.subscribe(itemsToMonitor);
  
    await timeout(10000);
  
    await opcClient.unsubscribe();
  
    const readData = await opcClient.readData("ns=1;b=1020FFAA", AttributeIds.Value);
    console.log('readData: ', readData);
  
    const nodeIdName = await opcClient.findNodeId('/Objects/Server.ServerStatus.BuildInfo.ProductName')
    console.log('nodeIdName: ', nodeIdName);
  
    await opcClient.disconnect();
  }
  catch(err) {
    console.log("An error has occured : ",err);
  }  
}

main();