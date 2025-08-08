"use strict";

const config = require('./config/config');
const logger = require('./util/logger');

const Remote = require('./model/remote');
const { pollingProcess, sendCommand, pollCancelled, getMetrics: getReceiveMetrics } = require('./serialPolling');
const smartrainHandler = require('./smartrainHandler');
const RabbitMQClient = require('./communication/channel/rabbitmqClient');
const axios = require('axios');
const { io } = require('socket.io-client');

const remotesList = global.gInterface.remotes;
const remotes = [];
const section = +global.gConfig.section;
const elementName = global.gConfig.name;
const keepaliveServer = global.gConfig.keepalive;
const report = {};

const COMMAND_TYPE = {
  COMMAND: "command",
  CONNECTIVITY: "connectivity",
  FULLSWEEP: "fullsweep",
}

let lastRemoteId = 0;
let serial = false;
let fieldbridge = false;
let activated = false;
let mqReconnection = false;
let listenMode = !global.gConfig.productionmode;

// - Bug: quando a remota está indisponível e torna-se disponível novamente ele não interroga
// - Precisa colocar o multicast aqui (pegar código no smartrainHandler do RailCore) e uma opção
// em global.gInterface.fieldbridge para isso. Nesse c

if (global.gInterface.serial) {
  serial = true;
}
else if (global.gInterface.fieldbridge) {
  fieldbridge = true;
}

const socket = io(keepaliveServer);

socket.on('connect', () => {
  console.log(`Connected to KeepAliveControl`);
  socket.emit('register', { nodeId: elementName, section, listenMode });
});

socket.on("connect_error", (error) => {
  if (socket.active) {
    // temporary failure, the socket will automatically try to reconnect
    console.log(`Waiting connection to KeepAliveControl`);
    if (activated) disconnect();
  } else {
    // the connection was denied by the server
    // in that case, `socket.connect()` must be manually called in order to reconnect
    console.log(error.message);
  }

  mqClient.stopConsumer();
});

socket.on('activate', () => {
  activated = true;
  if (mqClient?.isReady()) {
    console.log('Activated!');
    connect();
    mqClient.startConsumer();
  } else {
    console.log('Received activate command but mqClient not ready!!!');
    mqReconnection = true;
  }
});

socket.on('deactivate', () => {
  console.log('Deactivated!');
  activated = false;
  disconnect();
  mqClient.stopConsumer();
});

setInterval(() => {
  socket.emit('metrics', {
    nodeId: elementName,
    section,
    metrics: getReceiveMetrics()
  })
}, 5000);

const setConnectivity = (data) => {
  const remote = remotes[data.remote];

  if (remote) {
    remote.active = data.active;
    console.log(`connectivity command to remote of section ${data.section}, remote ${data.remote} active: ${data.active}`);

    if (!remote.active) {
      remote.clearRemote();

      mqClient
        .produce({
          section: data.section,
          remote: data.remote,
          full: false,
          connected: false,
          changed: []
        }, global.gConfig.producerRoutingKey)
        .catch(err => console.error(
          new Error('Error on send connectivity command.', err)
        ));
    } else {
      sendCommand({ remote: data.remote, port: 0xFF, value: 0x01 });
    }
  }
  else {
    console.log(`Remote null for connectivity command of section ${data.section}, remote ${data.remote} active: ${data.active} not found !!!`);
  }
};

/*const onCommandReceived = (cmd) => {
  console.log(`Command received: ${JSON.stringify(cmd)}`);
  if (global.gConfig.productionmode) {
    console.log(`@@@ productionmode: ${global.gConfig.productionmode}`);
    const info = JSON.parse(cmd);
    console.log(`@@@ info: ${JSON.stringify(info)}`);
    console.log(`@@@ section: ${section}, info.section: ${info.section}, remotes.length: ${remotes.length}, remotes[${info.remote}]: ${!!remotes[info.remote]}, info.type: ${info.type}, COMMAND_TYPE['COMMAND']: ${COMMAND_TYPE['COMMAND']}`);
    if (info.type === COMMAND_TYPE['FULLSWEEP']) {
      console.log('Full Sweep request received !!!');
      remotes.forEach((remote, index) => {
        remote.forceRecall = true;
        remote.fullsweep = true;
      });
    } else if ((+info.section === section) && (remotes.length > 0) && remotes[info.remote] && info.type) {
      console.log(`@@@ Condição válida para comando, tipo: ${info.type}`);
      switch (info.type) {
        case COMMAND_TYPE['COMMAND']:
          console.log(`@@@ Processando COMMAND para remoto ${info.remote}, ativo: ${remotes[info.remote].active}`);
          if (remotes[info.remote].active) {
            const remoteObj = remotes[info.remote];
            if (remoteObj) {
              console.log(`@@@ Chamando sendCommand para remoto ${info.remote}, serial: ${serial}`);
              if (serial) {
                sendCommand(info);
              } else {
                remoteObj.sendCommand(info);
              }
            } else {
              console.error(`remote ${info.remote} in section ${info.section} not found !`); 0
            }
          } else {
            console.log(`@@@ Remoto ${info.remote} não está ativo`);
          }
          break;
        case COMMAND_TYPE['CONNECTIVITY']:
          console.log(`@@@ Processando CONNECTIVITY para remoto ${info.remote}`);
          setConnectivity(info);
          break;
        default:
          console.log(`@@@ Tipo de comando desconhecido: ${info.type}`);
      }
    } else {
      console.log(`@@@ Comando ignorado: section=${info.section}, section esperado=${section}, remotes.length=${remotes.length}, remotes[${info.remote}]=${!!remotes[info.remote]}, info.type=${info.type}`);
    }
  } else {
    console.log('Command rejected because in listen mode');
  }
};*/

const onCommandReceived = (cmd) => {
  console.log(`Command received: ${JSON.stringify(cmd)}`);
  if (global.gConfig.productionmode) {
    console.log(`@@@ productionmode: ${global.gConfig.productionmode}`);
    let info;
    try {
      info = JSON.parse(cmd); // Adicionado try-catch
    } catch (e) {
      console.error(`@@@ Erro ao parsear comando: ${e.message}`);
      return;
    }
    console.log(`@@@ info: ${JSON.stringify(info)}`);
    console.log(`@@@ section: ${section}, info.section: ${info.section}, remotes.length: ${remotes.length}, remotes[${info.remote}]: ${!!remotes[info.remote]}, info.type: ${info.type}, COMMAND_TYPE['COMMAND']: ${COMMAND_TYPE['COMMAND']}`);
    if (info.type === COMMAND_TYPE['FULLSWEEP']) {
      console.log('Full Sweep request received !!!');
      remotes.forEach((remote, index) => {
        remote.forceRecall = true;
        remote.fullsweep = true;
      });
    } else if ((+info.section === section) && (remotes.length > 0) && remotes[info.remote] && info.type) {
      console.log(`@@@ Condição válida para comando, tipo: ${info.type}`);
      switch (info.type) {
        case COMMAND_TYPE['COMMAND']:
          console.log(`@@@ Processando COMMAND para remoto ${info.remote}, ativo: ${remotes[info.remote].active}`);
          if (remotes[info.remote].active) {
            const remoteObj = remotes[info.remote];
            if (remoteObj) {
              console.log(`@@@ Chamando sendCommand para remoto ${info.remote}, serial: ${serial}`);
              if (serial) {
                sendCommand(info);
              } else {
                remoteObj.sendCommand(info);
              }
            } else {
              console.error(`remote ${info.remote} in section ${info.section} not found !`);
            }
          } else {
            console.log(`@@@ Remoto ${info.remote} não está ativo`);
          }
          break;
        case COMMAND_TYPE['CONNECTIVITY']:
          console.log(`@@@ Processando CONNECTIVITY para remoto ${info.remote}`);
          setConnectivity(info);
          break;
        default:
          console.log(`@@@ Tipo de comando desconhecido: ${info.type}`);
      }
    } else {
      console.log(`@@@ Comando ignorado: section=${info.section}, section esperado=${section}, remotes.length=${remotes.length}, remotes[${info.remote}]=${!!remotes[info.remote]}, info.type=${info.type}`);
    }
  } else {
    console.log('Command rejected because in listen mode');
  }
};

// exchange_type: direct, topic, fanout, or headers
const mqClient = new RabbitMQClient(global.gConfig.brokerConnString,
  global.gConfig.consumerExchangeName,
  global.gConfig.consumerExchangeType,
  global.gConfig.consumerQueueName,
  global.gConfig.consumerRoutingKey,
  global.gConfig.producerExchangeName,
  global.gConfig.producerExchangeType,
  global.gConfig.producerQueueName,
  global.gConfig.producerRoutingKey,
  global.gConfig.producerMaxAttempts,
  global.gConfig.messageTTL,
  onCommandReceived);

mqClient.on('disconnect', () => {
  if (activated) {
    console.error(`@@@ Cancelling polling because MQ connection error`);
    disconnect();
    mqClient.stopConsumer();
    mqReconnection = true;
  }
});

mqClient.on('connect', () => {
  if (mqReconnection && activated) {
    console.log(`@@@ Re-starting polling process after MQ connection re-established`);
    connect();
    mqClient.startConsumer();
    mqReconnection = false;
  }
});

const mqClientReport = new RabbitMQClient(global.gConfig.brokerConnString,
  "",
  "",
  global.gConfig.consumerQueueName,
  global.gConfig.consumerRoutingKey,
  global.gConfig.producerReportExchangeName,
  global.gConfig.producerExchangeType,
  global.gConfig.producerQueueName,
  global.gConfig.producerRoutingKey,
  global.gConfig.producerMaxAttempts,
  global.gConfig.messageTTL);

// - Send to Server only the changes or remote disconnected
const onDataReceived = (info) => {
  if (!info.connected) {
    console.debug(`Remote ${info.remote} of section ${section} is disconnected !!!`);
  }
  else {
    console.debug(`Remote: ${JSON.stringify(info)}`);
    console.debug(`Remote ${info.remote} of section ${section} changed: ${JSON.stringify(info.changed)}`);
  }

  if (!fieldbridge) {
    info.section = section;
  }

  mqClient
    .produce(info, global.gConfig.producerRoutingKey)
    .catch(err => console.error(err));
}

// - Send to Server only the changes or remote disconnected
const onReportReceived = (info) => {
  mqClientReport.produce(info, global.gConfig.producerRoutingKey);
}

const connect = () => {
  console.log('@@@ Conected');
  for (let remote of remotes) {
    if (remote) remote.active = true;
  }

  if (serial) {
    console.log('Start polling...');
    pollingProcess(remotes, listenMode, onDataReceived, onReportReceived);
  }
}

const disconnect = () => {
  console.debug(`@@@ Disconnected !!!`);

  for (let remote of remotes) {
    if (remote) {
      remote.active = false;
      remote.forceRecall = true;
    }
  }

  if (serial) {
    pollCancelled();
  }
}

const keepalive = (data) => {
  console.debug(`keepalive received: ${JSON.stringify(data)}`);

  if (+data.section === section) {
    if (activated !== data.active) {
      if (data.active && !mqClient.isReady()) {
        console.log(`@@@ Ignoring keepalive because MQ connection closed!`);
        return;
      }

      data.active ? connect() : disconnect();

      activated = data.active;
      console.debug(`section ${section} active: ${data.active}`);
    }
  }
}

if (!fieldbridge) {
  remotesList.forEach((item, index) => {
    const remote = new Remote(item.address,
      global.gInterface.port,
      item.protocol,
      item.remoteId,
      item.words,
      global.gInterface.pollInterval,
      global.gInterface.recallFrequency,
      global.gInterface.disconnectPeriod,
      global.gInterface.timeoutLimit,
      global.gConfig.productionmode !== true,
      onDataReceived);
    console.log(`@@@Incializando remoto ${item.remoteId}, adress: ${item.adress}, protocol ${item.protocol}, listenmode: ${global.gConfig.productionmode !== true}`);

    if (item.remoteId >= 0) {
      remotes[item.remoteId] = remote;
      console.log(`@@@ remote[${item.remoteId}] configurado`);

      if (item.remoteId > lastRemoteId) {
        lastRemoteId = item.remoteId;
      }
    }
  });
  console.log(`@@@ Remotes inicializados: ${JSON.stringify(Object.keys(remotes).filter(k => remotes[k]))}`)

  // start in listenmode
  if (listenMode) {
    console.log('Start polling in listenmode...');
    pollingProcess(remotes, listenMode, onDataReceived, onReportReceived);
  }

  // - Keep Alive Request
  // console.log('Waiting for KeepAlive Server...');
  // setInterval(() => {
  //   axios.put(keepaliveServer, { section, serial, host: elementName, rate: 100 })
  //     .then((response) => {        
  //       keepalive(response.data);
  //     })
  //     .catch(err => {        
  //       disconnect();
  //       activated = false;
  //       console.error(`Error on KeepAlive request: ${err}`)
  //     });
  // }, global.gConfig.keepalivetime);
}
else {
  smartrainHandler(global.gInterface.multicast_interface,
    global.gInterface.multicast_ip,
    global.gInterface.multicast_port,
    onDataReceived);
}
