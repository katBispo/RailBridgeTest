"use strict";

const { startTestCase, sendChanges } = require('../../src/test');

const STATE = {
  WAITING_CONNECTION: 0x00,
  WAITING_COMMAND: 0x01,
}

// Testar rota composta

const INDICATION_INTERVAL = 3000;
let seq_indications = 0;
let currentState = STATE['WAITING_CONNECTION'];

const onDataReceived = (info) => {
  console.debug(JSON.stringify(info));

  if(info.connected) {
    if(currentState === STATE['WAITING_CONNECTION']) {
      sendChanges({section: 3, remote: 15, full: false, connected: true, changed: [{index: 12, value: 34}, {index: 11, value: 16}]});
      sendChanges({section: 4, remote: 20, full: false, connected: true, changed: [{index: 10, value: 64}, {index: 11, value: 8}, {index: 12, value: 32}]});

      //unBlocked
      sendChanges({section: 3, remote: 15, full: false, connected: true, changed: [{index: 50, value: 0}]});

      currentState = STATE['WAITING_COMMAND']; 
    }
    else if(info.section === 3 && info.remote === 15 && info.port === 26 && info.value === 1) {
      // Block Command !!!
      console.debug('Block Command !!!');

      //Blocked
      sendChanges({section: 3, remote: 15, full: false, connected: true, changed: [{index: 50, value: 128}]});
    }
    else if(info.section === 3 && info.remote === 15 && info.port === 26 && info.value === 2) {
      // UnBlock Command !!!
      console.debug('UnBlock Command !!!');

      //Confirm Unblock
      sendChanges({section: 3, remote: 15, full: false, connected: true, changed: [{index: 51, value: 1}]});
    }
    else if(info.section === 3 && info.remote === 15 && info.port === 26 && info.value === 4) {
      // Confirm Unblock Command !!!
      console.debug('Confirm Unblock Command !!!');

      //Unblock
      sendChanges({section: 3, remote: 15, full: false, connected: true, changed: [{index: 50, value: 0}]});
      sendChanges({section: 3, remote: 15, full: false, connected: true, changed: [{index: 51, value: 0}]});
    }
    else if(info.section === 3 && info.remote === 15 && info.port === 25 && info.value === 128) {
      // Enable Speed Code Command !!!
      console.debug('Enable Speed Code Command !!!');

      //Speed Code Enabled
      sendChanges({section: 3, remote: 15, full: false, connected: true, changed: [{index: 50, value: 0}]});
    }
    else if(info.section === 3 && info.remote === 15 && info.port === 25 && info.value === 64) {
      // Disable Speed Code Command !!!
      console.debug('Disable Speed Code Command !!!');

      sendChanges({section: 3, remote: 15, full: false, connected: true, changed: [{index: 50, value: 64}]});
    }
  }
}

startTestCase(onDataReceived);