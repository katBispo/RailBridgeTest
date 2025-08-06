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
      sendChanges({section: 3, remote: 2, full: false, connected: true, changed: [
          {index: 1, value: 0}, {index: 2, value: 1}, {index: 3, value: 4}, 
          {index: 4, value: 66}, {index: 5, value: 32}, {index: 6, value: 132}, 
          {index: 7, value: 66}, {index: 8, value: 40}, {index: 9, value: 0}, 
          {index: 10, value: 240}, {index: 11, value: 0}, {index: 12, value: 0}, 
          {index: 13, value: 0}, {index: 14, value: 8}, {index: 15, value: 0}, 
          {index: 16, value: 1}, {index: 17, value: 8}, {index: 18, value: 2}, 
          {index: 19, value: 65}, {index: 20, value: 0}, {index: 21, value: 0}, 
          {index: 22, value: 224}, {index: 23, value: 226}, {index: 24, value: 45}, 
          {index: 25, value: 176}, {index: 26, value: 0}, {index: 27, value: 0}, 
          {index: 28, value: 0}, {index: 29, value: 3}, {index: 30, value: 0}, 
          {index: 31, value: 0}, {index: 32, value: 0}, {index: 33, value: 0}, 
          {index: 34, value: 24}, {index: 35, value: 0}, {index: 36, value: 0}, 
          {index: 37, value: 0}, {index: 38, value: 0}, {index: 39, value: 0}, 
          {index: 40, value: 0}, {index: 41, value: 0}, {index: 42, value: 0}, 
          {index: 43, value: 0}, {index: 44, value: 5}, {index: 45, value: 10}, 
          {index: 46, value: 0}
        ]
      });

      // sendChanges({section: 3, remote: 1, full: false, connected: true, changed: [
      //   {index: 3, value: 4}, {index: 4, value: 2} 
      // ]
      // });

      // sendChanges({section: 3, remote: 2, full: false, connected: true, changed: [
      //   {index: 3, value: 4}, {index: 4, value: 2} 
      // ]
      // });

      seq_indications = 1;

      currentState = STATE['WAITING_COMMAND']; 
    }
  }
}

startTestCase(onDataReceived);