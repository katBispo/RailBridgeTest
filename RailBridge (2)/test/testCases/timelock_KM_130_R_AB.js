"use strict";

const { startTestCase, sendChanges } = require('../../src/test');

const STATE = {
  WAITING_CONNECTION: 0x00,
  WAITING_ROUTE_REQUEST: 0x01,
  WAITING_ROUTE_CANCEL: 0x02,
  WAITING_ROUTE_CANCEL: 0x02,
}

let seq_indications = 0;
const INDICATION_INTERVAL = 2000;
let currentState = STATE['WAITING_CONNECTION'];

const onDataReceived = (info) => {
  console.debug(JSON.stringify(info));

  if(info.connected) {
    if(currentState === STATE['WAITING_CONNECTION']) {
      sendChanges({section: 1, remote: 15, full: false, connected: true, changed: [{index: 13, value: 128}]});
      sendChanges({section: 1, remote: 15, full: false, connected: true, changed: [{index: 1, value: 0}]});
      sendChanges({section: 1, remote: 15, full: false, connected: true, changed: [{index: 3, value: 0}]});
      sendChanges({section: 1, remote: 16, full: false, connected: true, changed: [{index: 1, value: 0}]});

      currentState = STATE['WAITING_ROUTE_REQUEST']; 
    }
    else if(info.section === 1 && info.remote === 15 && info.port === 1 && info.value === 1) {
      if(currentState === STATE['WAITING_ROUTE_REQUEST']) {
        console.debug(' -------- test case: WAITING_ROUTE_REQUEST started !!!');      
        seq_indications = 1;

        setTimeout(() => {
          console.debug('Send Route KM130.R_AB GRANTED');
          sendChanges({section: 1, remote: 15, full: false, connected: true, changed: [{index: 1, value: 1}]});

          currentState = STATE['WAITING_ROUTE_CANCEL'];
        }, INDICATION_INTERVAL * seq_indications);
      }
    }
    else if(info.section === 1 && info.remote === 15 && info.port === 2 && info.value === 1) {
      if(currentState === STATE['WAITING_ROUTE_CANCEL']) {
        console.debug(' -------- test case: WAITING_ROUTE_CANCEL started !!!');      
        seq_indications = 1;

        setTimeout(() => {
          console.debug('Send Route KM130.R_AB Time Locked');
          sendChanges({section: 1, remote: 15, full: false, connected: true, changed: [{index: 3, value: 1}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications *= 3;

        setTimeout(() => {
          console.debug('Send Route KM130.R_AB Time Locked expired');
          sendChanges({section: 1, remote: 15, full: false, connected: true, changed: [{index: 1, value: 0}, {index: 3, value: 0}]});
        }, INDICATION_INTERVAL * seq_indications);
      }
    }
    else {
      console.log('Invalid option');
    }
  }
}

startTestCase(onDataReceived);