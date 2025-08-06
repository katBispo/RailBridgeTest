"use strict";

const logger = require('./util/logger');
const config = require('./config/config');
const RabbitMQClient = require('./communication/channel/rabbitmqClient');
const io = require('socket.io-client');

const socket = io(global.gConfig.server);

let connected = false;
let onDataReceived;
let mqClient;

// - Send to Server only the changes or remote disconnected
const sendChanges = (info) => {
  if(!info.connected) {
    console.debug(`sending Remote ${info.remote} of section ${info.section} is disconnected !!!`);
  }
  else {
    console.debug(`sending Remote ${info.remote} of section ${info.section} changed: ${JSON.stringify(info.changed)}`);
  }

  // info.section = section;

  try {
    socket.emit('changed', info);
    mqClient.produce(info, global.gConfig.producerRoutingKey);
  }
  catch(err) {
    console.error(err);
  }
}

// - Send all data to server on connect
socket.on('connect', () => {
  console.debug(`I connected to RailCore server !!!`);

  connected = true;

  onDataReceived({connected});
});

socket.on('clear', (info) => {
  console.debug(`clear indications received: ${JSON.stringify(info)}`);
});

/*
{section, remote, port, value} 
*/
socket.on('command', (info) => {
  console.debug(`command received: ${JSON.stringify(info)}`);

  info.connected = connected;

  onDataReceived(info);
});

socket.on('disconnect', () => {
  console.debug(`RailCore server disconnected`);

  connected = false;
});

socket.on('error', (error) => {
  console.error(error);
});

const startTestCase = (cb) => {
  onDataReceived = cb;

  // exchange_type: direct, topic, fanout, or headers
  mqClient = new RabbitMQClient(global.gConfig.brokerConnString, 
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
    onDataReceived);
}

module.exports = { startTestCase, sendChanges };