"use strict";

const { startTestCase, sendChanges } = require('../../../src/test');

const STATE = {
  WAITING_CONNECTION: 0x00,
  WAITING_COMMAND: 0x01,
  REAL_ROUTE_GRANTED: 0x02,
  REAL_ROUTE_REGISTERED: 0x03,
  REAL_ROUTE_TIMELOCKED: 0x04,
  VIRTUAL_ROUTE_GRANTED: 0x05,
  VIRTUAL_ROUTE_REGISTERED: 0x06,
  VIRTUAL_ROUTE_AVAILABLE: 0x07,
  LOCKED_ROUTE: 0x08,
}

const INDICATION_INTERVAL = 3000;
let seq_indications = 0;
let currentState = STATE['WAITING_CONNECTION'];

const onDataReceived = (info) => {
  console.debug(JSON.stringify(info));

  if(info.connected) {
    if(currentState === STATE['WAITING_CONNECTION']) {
      //Send Route KM512.R_CE AVAILABLE - Virtual Route
      sendChanges({section: 3, remote: 15, full: false, connected: true, changed: [{index: 52, value: 0}, {index: 53, value: 0}]});

      //Send Route KM512.R_CD AVAILABLE - Real Route
      sendChanges({section: 3, remote: 15, full: false, connected: true, changed: [{index: 1, value: 0}, {index: 2, value: 0}, {index: 3, value: 0}]});

      //Send Route KM512.R_DE AVAILABLE - Virtual Route
      sendChanges({section: 4, remote: 20, full: false, connected: true, changed: [{index: 52, value: 0}]});

      //Send Route KM512.R_DC AVAILABLE - Real Route
      sendChanges({section: 4, remote: 20, full: false, connected: true, changed: [{index: 1, value: 0}, {index: 2, value: 0}, {index: 3, value: 0}]});

      //Send Route KM518.WT Occup1 - false
      // sendChanges({section: 4, remote: 20, full: false, connected: true, changed: [{index: 12, value: 128}]});
      sendChanges({section: 4, remote: 20, full: false, connected: true, changed: [{index: 12, value: 0}]});

      //Send Route KM518.WT Occup2 - false
      // sendChanges({section: 3, remote: 15, full: false, connected: true, changed: [{index: 13, value: 8}]});
      sendChanges({section: 4, remote: 20, full: false, connected: true, changed: [{index: 13, value: 0}]});

      sendChanges({section: 3, remote: 15, full: false, connected: true, changed: [{index: 12, value: 34}, {index: 11, value: 16}]});
      sendChanges({section: 4, remote: 20, full: false, connected: true, changed: [{index: 10, value: 64}, {index: 11, value: 8}, {index: 12, value: 32}]});

      currentState = STATE['LOCKED_ROUTE']; 
    }
    else if(info.section === 4 && info.remote === 20 && info.port === 2 && info.value === 2) {
      // Cancel Route KM518.R_DC

      console.debug('Cancell route KM518.R_DC received !!!');

      //Send Route KM518.R_DE AVAILABLE - Virtual Route Mirror
      sendChanges({section: 4, remote: 20, full: false, connected: true, changed: [{index: 52, value: 0}]});

      //Send Route KM518.R_DC AVAILABLE - Real Route
      sendChanges({section: 4, remote: 20, full: false, connected: true, changed: [{index: 2, value: 0}]});

      //Send Route KM518.R_BC AVAILABLE - Real Route
      sendChanges({section: 4, remote: 20, full: false, connected: true, changed: [{index: 3, value: 0}]});
    }
    else if(info.section === 4 && info.remote === 20 && info.port === 1 && info.value === 64) {
        // Requested Route KM518.R_BC
        console.debug('Requested Route KM518.R_BC !!!');

        if(currentState === STATE['LOCKED_ROUTE']) {
          console.debug(' -------- test case: LOCKED_ROUTE started !!!');
  
          //Send Route KM518.R_BC GRANTED - Real Route
          // console.debug('Send Route KM518.R_DC GRANTED - Real Route');
          // sendChanges({section: 4, remote: 20, full: false, connected: true, changed: [{index: 2, value: 16}]});
    
          seq_indications = 1;
          setTimeout(() => {
            console.debug('Send Route KM518.R_DE GRANTED - Virtual Route');
            //Send Route KM518.R_DE GRANTED - Virtual Route
            sendChanges({section: 4, remote: 20, full: false, connected: true, changed: [{index: 2, value: 16}, {index: 52, value: 32}]});
          }, INDICATION_INTERVAL * seq_indications);
  
          seq_indications++;
          setTimeout(() => { 
            console.debug('Send Indication KM518.WT Occup2 = true');
            //Send Indication KM518.WT Occup1 = true
            sendChanges({section: 4, remote: 20, full: false, connected: true, changed: [{index: 13, value: 8}]});
          }, INDICATION_INTERVAL * seq_indications);
  
          seq_indications++;
          setTimeout(() => {
            console.debug('Send Route KM518.R_BC UNGRANTED - Real Route');
            //Send Route KM518.R_BC UNGRANTED - Real Route
            sendChanges({section: 4, remote: 20, full: false, connected: true, changed: [{index: 2, value: 0}]});
          }, INDICATION_INTERVAL * seq_indications);
  
          seq_indications++;
          seq_indications++;
          setTimeout(() => {
            console.debug('Send Indication KM518.WT Occup1 - false');
            //Send Indication KM518.WT Occup1 - false
            sendChanges({section: 4, remote: 20, full: false, connected: true, changed: [{index: 12, value: 32}]});
  
            console.debug('Send Indication KM518.WT Occup2 - false');
            //Send Indication KM518.WT Occup2 - false
            sendChanges({section: 4, remote: 20, full: false, connected: true, changed: [{index: 13, value: 0}]});
  
            //Send Route KM518.R_DE AVAILABLE - Virtual Route Mirror
            sendChanges({section: 4, remote: 20, full: false, connected: true, changed: [{index: 52, value: 0}]});

            //Send Route KM518.R_DC AVAILABLE - Real Route
            sendChanges({section: 4, remote: 20, full: false, connected: true, changed: [{index: 2, value: 0}]});

            //Send Route KM518.R_DC AVAILABLE - Real Route
            sendChanges({section: 4, remote: 20, full: false, connected: true, changed: [{index: 3, value: 0}]});
  
            currentState = STATE['REAL_ROUTE_GRANTED'];
          }, INDICATION_INTERVAL * seq_indications);
        }
        if(currentState === STATE['REAL_ROUTE_GRANTED']) {
        console.debug(' -------- test case: REAL_ROUTE_GRANTED started !!!');

        console.debug('Send Route KM518.R_DC GRANTED - Real Route');
        //Send Route KM518.R_DC GRANTED - Real Route
        sendChanges({section: 4, remote: 20, full: false, connected: true, changed: [{index: 2, value: 16}]});

        seq_indications = 1;

        setTimeout(() => {
          console.debug('Send Route KM518.R_DE GRANTED - Virtual Route');
          //Send Route KM518.R_DE GRANTED - Virtual Route
          sendChanges({section: 4, remote: 20, full: false, connected: true, changed: [{index: 52, value: 32}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route KM518.R_DE REGISTRED - Virtual Route');
          //Send Route KM518.R_DE REGISTRED - Virtual Route
          sendChanges({section: 4, remote: 20, full: false, connected: true, changed: [{index: 52, value: 64}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route KM518.R_DE AVAILABLE - Virtual Route');
          //Send Route KM518.R_DE AVAILABLE - Virtual Route
          sendChanges({section: 4, remote: 20, full: false, connected: true, changed: [{index: 52, value: 0}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route KM518.R_DE GRANTED - Virtual Route');
          //Send Route KM518.R_DE GRANTED - Virtual Route
          sendChanges({section: 4, remote: 20, full: false, connected: true, changed: [{index: 52, value: 32}]});

          currentState = STATE['REAL_ROUTE_REGISTERED'];
        }, INDICATION_INTERVAL * seq_indications);
      }
      if(currentState === STATE['REAL_ROUTE_REGISTERED']) {
        console.debug(' -------- test case: REAL_ROUTE_REGISTERED started !!!');

        console.debug('Send Route KM518.R_BC REGISTERED - Real Route');
        //Send Route KM518.R_BC REGISTERED - Real Route
        sendChanges({section: 4, remote: 20, full: false, connected: true, changed: [{index: 2, value: 32}]});

        seq_indications = 1;

        setTimeout(() => {
          console.debug('Send Route KM518.R_DE GRANTED - Virtual Route');
          //Send Route KM518.R_DE GRANTED - Virtual Route
          sendChanges({section: 4, remote: 20, full: false, connected: true, changed: [{index: 52, value: 32}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route KM518.R_DE REGISTRED - Virtual Route');
          //Send Route KM518.R_DE REGISTRED - Virtual Route
          sendChanges({section: 4, remote: 20, full: false, connected: true, changed: [{index: 52, value: 64}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route KM518.R_DE AVAILABLE - Virtual Route');
          //Send Route KM518.R_DE AVAILABLE - Virtual Route
          sendChanges({section: 4, remote: 20, full: false, connected: true, changed: [{index: 52, value: 0}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route KM518.R_DE GRANTED - Virtual Route');
          //Send Route KM518.R_DE GRANTED - Virtual Route
          sendChanges({section: 4, remote: 20, full: false, connected: true, changed: [{index: 52, value: 32}]});

          currentState = STATE['REAL_ROUTE_TIMELOCKED'];
        }, INDICATION_INTERVAL * seq_indications);
      }      
      if(currentState === STATE['REAL_ROUTE_TIMELOCKED']) {
        console.debug(' -------- test case: REAL_ROUTE_TIMELOCKED started !!!');

        console.debug('Send Route KM518.R_BC GRANTED - Real Route');
        //Send Route KM518.R_BC GRANTED - Real Route
        sendChanges({section: 4, remote: 20, full: false, connected: true, changed: [{index: 2, value: 16}]});

        console.debug('Send Route KM518.R_BC TIMELOCKED - Real Route');
        //Send Route KM518.R_DC TIMELOCKED - Real Route
        sendChanges({section: 4, remote: 20, full: false, connected: true, changed: [{index: 3, value: 2}]});

        seq_indications = 1;

        setTimeout(() => {
          console.debug('Send Route KM518.R_DE GRANTED - Virtual Route');
          //Send Route KM518.R_DE GRANTED - Virtual Route
          sendChanges({section: 4, remote: 20, full: false, connected: true, changed: [{index: 52, value: 32}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route KM518.R_DE REGISTRED - Virtual Route');
          //Send Route KM518.R_DE REGISTRED - Virtual Route
          sendChanges({section: 4, remote: 20, full: false, connected: true, changed: [{index: 52, value: 64}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route KM518.R_DE AVAILABLE - Virtual Route');
          //Send Route KM518.R_DE AVAILABLE - Virtual Route
          sendChanges({section: 4, remote: 20, full: false, connected: true, changed: [{index: 52, value: 0}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route KM518.R_DC UNTIMELOCKED - Real Route');
          //Send Route KM518.R_DC UNTIMELOCKED - Real Route
          sendChanges({section: 4, remote: 20, full: false, connected: true, changed: [{index: 3, value: 0}]});

          console.debug('Send Route KM518.R_DE GRANTED - Virtual Route');
          //Send Route KM518.R_DE GRANTED - Virtual Route
          sendChanges({section: 4, remote: 20, full: false, connected: true, changed: [{index: 52, value: 32}]});

          currentState = STATE['VIRTUAL_ROUTE_GRANTED'];
        }, INDICATION_INTERVAL * seq_indications);
      }
      if(currentState === STATE['VIRTUAL_ROUTE_GRANTED']) {
        console.debug(' -------- test case: VIRTUAL_ROUTE_GRANTED started !!!');

        console.debug('Send Route KM518.R_DE GRANTED - Virtual Route');
        //Send Route KM518.R_DE GRANTED - Virtual Route
        sendChanges({section: 4, remote: 20, full: false, connected: true, changed: [{index: 52, value: 32}]});

        seq_indications = 1;

        setTimeout(() => {
            console.debug('Send Route KM518.R_DC GRANTED - Real Route');
            //Send Route KM518.R_DC GRANTED - Real Route
            sendChanges({section: 4, remote: 20, full: false, connected: true, changed: [{index: 2, value: 16}]});
          }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route KM518.R_DC TIMELOCKED - Real Route');
          //Send Route KM518.R_DC TIMELOCKED - Real Route
          sendChanges({section: 4, remote: 20, full: false, connected: true, changed: [{index: 3, value: 2}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route KM518.R_DC UNTIMELOCKED - Real Route');
          //Send Route KM518.R_DC UNTIMELOCKED - Real Route
          sendChanges({section: 4, remote: 20, full: false, connected: true, changed: [{index: 3, value: 0}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route KM518.R_DC REGISTERED - Real Route');
          //Send Route KM518.R_DC REGISTERED - Real Route
          sendChanges({section: 4, remote: 20, full: false, connected: true, changed: [{index: 2, value: 32}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route KM518.R_DC AVAILABLE - Real Route');
          //Send Route KM518.R_DC AVAILABLE - Real Route
          sendChanges({section: 4, remote: 20, full: false, connected: true, changed: [{index: 2, value: 0}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route KM518.R_DC GRANTED - Real Route');
          //Send Route KM518.R_DC GRANTED - Real Route
          sendChanges({section: 4, remote: 20, full: false, connected: true, changed: [{index: 2, value: 16}]});

          currentState = STATE['VIRTUAL_ROUTE_REGISTERED'];
        }, INDICATION_INTERVAL * seq_indications);
      }      
      if(currentState === STATE['VIRTUAL_ROUTE_REGISTERED']) {
        console.debug(' -------- test case: VIRTUAL_ROUTE_REGISTERED started !!!');

        console.debug('Send Route KM518.R_DE REGISTRED - Virtual Route');
        //Send Route KM518.R_DE REGISTRED - Virtual Route
        sendChanges({section: 4, remote: 20, full: false, connected: true, changed: [{index: 52, value: 64}]});

        seq_indications = 1;

        setTimeout(() => {
          console.debug('Send Route KM518.R_DC GRANTED - Real Route');
          //Send Route KM518.R_DC GRANTED - Real Route
          sendChanges({section: 4, remote: 20, full: false, connected: true, changed: [{index: 2, value: 16}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route KM518.R_DC REGISTERED - Real Route');
          //Send Route KM518.R_DC REGISTERED - Real Route
          sendChanges({section: 4, remote: 20, full: false, connected: true, changed: [{index: 2, value: 32}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route KM518.R_DC TIMELOCKED - Real Route');
          //Send Route KM518.R_DC TIMELOCKED - Real Route
          sendChanges({section: 4, remote: 20, full: false, connected: true, changed: [{index: 3, value: 2}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route KM518.R_DC UNTIMELOCKED - Real Route');
          //Send Route KM518.R_DC UNTIMELOCKED - Real Route
          sendChanges({section: 4, remote: 20, full: false, connected: true, changed: [{index: 3, value: 0}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route KM518.R_DC AVAILABLE - Real Route');
          //Send Route KM518.R_DC AVAILABLE - Real Route
          sendChanges({section: 4, remote: 20, full: false, connected: true, changed: [{index: 2, value: 0}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route KM518.R_DC GRANTED - Real Route');
          //Send Route KM518.R_DC GRANTED - Real Route
          sendChanges({section: 4, remote: 20, full: false, connected: true, changed: [{index: 2, value: 16}]});

          currentState = STATE['VIRTUAL_ROUTE_AVAILABLE'];
        }, INDICATION_INTERVAL * seq_indications);
      }
      if(currentState === STATE['VIRTUAL_ROUTE_AVAILABLE']) {
        console.debug(' -------- test case: VIRTUAL_ROUTE_AVAILABLE started !!!');

        seq_indications = 1;

        setTimeout(() => {
          console.debug('Send Route KM518.R_DC GRANTED - Real Route');
          //Send Route KM518.R_DC GRANTED - Real Route
          sendChanges({section: 4, remote: 20, full: false, connected: true, changed: [{index: 2, value: 16}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route KM518.R_DC REGISTERED - Real Route');
          //Send Route KM518.R_DC REGISTERED - Real Route
          sendChanges({section: 4, remote: 20, full: false, connected: true, changed: [{index: 2, value: 32}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route KM518.R_DC TIMELOCKED - Real Route');
          //Send Route KM518.R_DC TIMELOCKED - Real Route
          sendChanges({section: 4, remote: 20, full: false, connected: true, changed: [{index: 3, value: 2}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route KM518.R_DC UNTIMELOCKED - Real Route');
          //Send Route KM518.R_DC UNTIMELOCKED - Real Route
          sendChanges({section: 4, remote: 20, full: false, connected: true, changed: [{index: 3, value: 0}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route KM518.R_DC AVAILABLE - Real Route');
          //Send Route KM518.R_DC AVAILABLE - Real Route
          sendChanges({section: 4, remote: 20, full: false, connected: true, changed: [{index: 2, value: 0}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route KM518.R_DC GRANTED - Real Route');
          //Send Route KM518.R_DC GRANTED - Real Route
          sendChanges({section: 4, remote: 20, full: false, connected: true, changed: [{index: 2, value: 16}]});

          currentState = STATE['REAL_ROUTE_GRANTED'];
        }, INDICATION_INTERVAL * seq_indications);
      }      
    }
  }
}

startTestCase(onDataReceived);