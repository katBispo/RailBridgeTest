"use strict";

const { startTestCase, sendChanges } = require('../../src/test');

const STATE = {
  WAITING_CONNECTION: 0x00,
  WAITING_COMMAND: 0x01,
}

const FLOOD_LEVEL = 20000;
const INDICATION_INTERVAL = 2;
let seq_indications = 0;
let currentState = STATE['WAITING_CONNECTION'];

const onDataReceived = (info) => {
  console.debug(JSON.stringify(info));

  if(info.connected) {
    if(currentState === STATE['WAITING_CONNECTION']) {
      sendChanges({section: 5, remote: 9, full: false, connected: true, changed: [{index: 22, value: 224}]});
      sendChanges({section: 5, remote: 22, full: false, connected: true, changed: [{index: 12, value: 0}]});
      sendChanges({section: 5, remote: 24, full: false, connected: true, changed: [{index: 1, value: 0}]});

      seq_indications = 1;

      for(let i = 0; i < 200; i++) {
        setTimeout(() => {
          console.debug(i + ' > Send Carajas.KM830.TU_KM830 LocalCtrl true');
          sendChanges({section: 5, remote: 9, full: false, connected: true, changed: [{index: 22, value: 226}]});
  
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;
      }

      for(let i = 0; i < FLOOD_LEVEL; i++) {
        setTimeout(() => {
          console.debug(i + ' > Send Carajas.KM858.SW03T Occup false');
          sendChanges({section: 5, remote: 22, full: false, connected: true, changed: [{index: 12, value: 0}]});
  
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug(i + ' > Send Carajas.KM858.SW03T Occup true');
          sendChanges({section: 5, remote: 22, full: false, connected: true, changed: [{index: 12, value: 128}]});
  
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

      }

      // setTimeout(() => {
      //   console.debug('Send Carajas.KM858.R_AB true');
      //   sendChanges({section: 5, remote: 24, full: false, connected: true, changed: [{index: 1, value: 1}]});

      // }, INDICATION_INTERVAL * seq_indications);

      // seq_indications++;

      currentState = STATE['WAITING_COMMAND']; 
    }
  }
}

startTestCase(onDataReceived);