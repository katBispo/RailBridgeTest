"use strict";

const { startTestCase, sendChanges } = require('../../src/test');

const STATE = {
  WAITING_CONNECTION: 0x00,
  WAITING_COMMAND: 0x01,
}

// These are the commands from TrackBuilder and its indications
const commands = {
  '1.1': {port: 1, value: 1, cmdActive: true},
  '1.2': {port: 1, value: 4, cmdActive: true},
  '1.4': {port: 1, value: 16, cmdActive: true},
  '1.8': {port: 1, value: 64, cmdActive: true},
  '1.128': {port: 2, value: 64, cmdActive: true},
  '1.64': {port: 2, value: 16, cmdActive: true},
  '1.32': {port: 2, value: 4, cmdActive: true},
  '1.16': {port: 2, value: 1, cmdActive: true},
  '7.4': {port: 14, value: 2, cmdActive: true}, //Block 1E1T
  '7.8': {port: 14, value: 4, cmdActive: true}, //UnBlock 1E1T
  '7.16': {port: 14, value: 6, cmdActive: false}, //Conf UnBlock 1E1T
  '8.16': {port: 15, value: 32, cmdActive: true}, //Block 2E1T
  '8.32': {port: 15, value: 64, cmdActive: true}, //UnBlock 2E1T
  '8.64': {port: 15, value: 96, cmdActive: false}, //Conf UnBlock 2E1T
  '9.64': {port: 17, value: 2, cmdActive: true}, //Block 1D1T
  '9.128': {port: 17, value: 4, cmdActive: true}, //UnBlock 1D1T
  '10.1': {port: 17, value: 6, cmdActive: false}, //Conf UnBlock 1D1T
  '11.1': {port: 18, value: 32, cmdActive: true}, //Block 2D1T
  '11.2': {port: 18, value: 64, cmdActive: true}, //UnBlock 2D1T
  '11.4': {port: 18, value: 96, cmdActive: false}, //Conf UnBlock 2D1T
  '10.8': {port: 17, value: 128, cmdActive: true}, //Block 1D2T
  '10.16': {port: 18, value: 1, cmdActive: true}, //UnBlock 1D2T
  '10.32': {port: 17, value: 128, cmdActive: false}, //Conf UnBlock 1D2T
  '11.32': {port: 19, value: 8, cmdActive: true}, //Block 2D2T
  '11.64': {port: 19, value: 16, cmdActive: true}, //UnBlock 2D2T
  '11.128': {port: 19, value: 24, cmdActive: false}, //Conf UnBlock 2D2T
  '24.64': {port: 49, value: 8, cmdActive: true}, //Block 1D3T
  '24.128': {port: 49, value: 16, cmdActive: true}, //UnBlock 1D3T
  '25.1': {port: 49, value: 24, cmdActive: false}, //Conf UnBlock 1D3T
  '26.1': {port: 50, value: 128, cmdActive: true}, //Block 2D3T
  '26.2': {port: 51, value: 1, cmdActive: true}, //UnBlock 2D3T
  '26.4': {port: 50, value: 128, cmdActive: false}, //Conf UnBlock 2D3T
  '7.128': {port: 14, value: 128, cmdActive: true}, //Block 1E2T
  '8.1': {port: 15, value: 1, cmdActive: true}, //UnBlock 1E2T
  '8.2': {port: 14, value: 128, cmdActive: false}, //Conf UnBlock 1E2T
  '9.2': {port: 16, value: 8, cmdActive: true}, //Block 2E2T
  '9.4': {port: 16, value: 16, cmdActive: true}, //UnBlock 2E2T
  '9.8': {port: 16, value: 24, cmdActive: false}, //Conf UnBlock 2E2T
  '2.1': {port: 1, value: 85, cmdActive: false},
  '2.2': {port: 2, value: 85, cmdActive: false},
}

// The current indications are stored here
const indications = [];

const INDICATION_INTERVAL = 2000;
let currentState = STATE['WAITING_CONNECTION'];

const onDataReceived = (info) => {
  console.debug(info);

  const data = JSON.parse(info);

  // const data = info.replace(/['"]+/g, '');

  if(currentState === STATE['WAITING_CONNECTION']) {
    // sendChanges({section: 1, remote: 15, full: false, connected: true, changed: [{index: 13, value: 128}]});
    // sendChanges({section: 1, remote: 16, full: false, connected: true, changed: [{index: 18, value: 0}]});
    // sendChanges({section: 1, remote: 17, full: false, connected: true, changed: [{index: 16, value: 128}]});

    // sendChanges({section: 1, remote: 3, full: false, connected: true, changed: [{index: 18, value: 8}]});
    // sendChanges({section: 1, remote: 3, full: false, connected: true, changed: [{index: 27, value: 1}]});
    // sendChanges({section: 1, remote: 26, full: false, connected: true, changed: [{index: 16, value: 128}]});

    // sendChanges({section: 1, remote: 25, full: false, connected: true, changed: [{index: 10, value: 64}]});

    // sendChanges({section: 1, remote: 25, full: false, connected: true, changed: [{index: 3, value: 8}]});
    // sendChanges({section: 1, remote: 25, full: false, connected: true, changed: [{index: 4, value: 4}]});
    // sendChanges({section: 1, remote: 25, full: false, connected: true, changed: [{index: 1, value: 0}]});

    // sendChanges({section: 1, remote: 25, full: false, connected: true, changed: [{index: 3, value: 4}]});
    // sendChanges({section: 1, remote: 25, full: false, connected: true, changed: [{index: 4, value: 2}]});
    // sendChanges({section: 1, remote: 25, full: false, connected: true, changed: [{index: 11, value: 8}]});
    // sendChanges({section: 1, remote: 25, full: false, connected: true, changed: [{index: 12, value: 1}]});

    // sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 11, value: 8}]});
    // sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 10, value: 64}]});

    // KM029.CDV_1D1T Occup
    sendChanges({section: 1, remote: 27, full: false, connected: true, changed: [{index: 16, value: 128}]});

    currentState = STATE['WAITING_COMMAND']; 
  }

  // console.log(`searching for '${data.port}.${data.value}'`);

  if(commands[`${data.port}.${data.value}`]) {
    const {port, value, cmdActive} = commands[`${data.port}.${data.value}`];
    let newValue;
    let current = 0;

    if(indications[port]) {
      current = indications[port];
    }

    if(cmdActive) {
      newValue = current | value;
    }
    else {
      newValue = current & !value;
    }
    indications[port] = newValue;

    setTimeout(() => {
      console.debug(`Sending indication for ${port}: ${newValue}`);
      sendChanges({section: data.section, remote: data.remote, full: false, connected: true, changed: [{index: port, value: newValue}]});
    }, INDICATION_INTERVAL);
  }
  else {
    console.debug('Command translation not found !!!');
  }
}

startTestCase(onDataReceived);