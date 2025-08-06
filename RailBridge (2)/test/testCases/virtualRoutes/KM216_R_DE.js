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

// Test Case 1:
// Rota real Available x Rota Virtual Available
// Rota real GRANTED x Rote Virtual Available
// Rota real GRANTED x Rote Virtual GRANTED
// Rota real GRANTED x Rote Virtual REGISTRED
// Rota real GRANTED x Rote Virtual Available
// Rota real GRANTED x Rote Virtual GRANTED

// Test Case 2:
// Rota real Available x Rota Virtual Available
// Rota real REGISTRED x Rote Virtual Available
// Rota real REGISTRED x Rote Virtual GRANTED
// Rota real REGISTRED x Rote Virtual REGISTRED
// Rota real REGISTRED x Rote Virtual Available
// Rota real REGISTRED x Rote Virtual GRANTED

// Test Case 3:
// Rota real Available x Rota Virtual Available
// Rota real TIMELOCKED x Rote Virtual Available
// Rota real TIMELOCKED x Rote Virtual GRANTED
// Rota real TIMELOCKED x Rote Virtual REGISTRED
// Rota real TIMELOCKED x Rote Virtual Available
// Rota real GRANTED x Rote Virtual GRANTED

// Test Case 4:
// Rota real Available x Rota Virtual Available
// Rota real Available x Rote Virtual GRANTED
// Rota real GRANTED x Rote Virtual GRANTED
// Rota real REGISTRED x Rote Virtual GRANTED
// Rota real TIMELOCKED x Rote Virtual GRANTED
// Rota real UNTIMELOCKED x Rote Virtual GRANTED
// Rota real AVAILABLE x Rote Virtual GRANTED
// Rota real GRANTED x Rote Virtual GRANTED

// Test Case 4:
// Rota real Available x Rota Virtual Available
// Rota real Available x Rote Virtual REGISTRED
// Rota real GRANTED x Rote Virtual REGISTRED
// Rota real REGISTRED x Rote Virtual REGISTRED
// Rota real TIMELOCKED x Rote Virtual REGISTRED
// Rota real UNTIMELOCKED x Rote Virtual REGISTRED
// Rota real AVAILABLE x Rote Virtual REGISTRED
// Rota real GRANTED x Rote Virtual REGISTRED

// Test Case 5:
// Rota real Available x Rota Virtual Available
// Rota real Available x Rote Virtual AVAILABLE
// Rota real GRANTED x Rote Virtual AVAILABLE
// Rota real REGISTRED x Rote Virtual AVAILABLE
// Rota real TIMELOCKED x Rote Virtual AVAILABLE
// Rota real UNTIMELOCKED x Rote Virtual AVAILABLE
// Rota real AVAILABLE x Rote Virtual AVAILABLE
// Rota real GRANTED x Rote Virtual AVAILABLE

const INDICATION_INTERVAL = 3000;
let seq_indications = 0;
let currentState = STATE['WAITING_CONNECTION'];

const onDataReceived = (info) => {
  console.debug(JSON.stringify(info));

  if(info.connected) {
    if(currentState === STATE['WAITING_CONNECTION']) {
      sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 10, value: 64}, {index: 11, value: 8}]});
      sendChanges({section: 1, remote: 25, full: false, connected: true, changed: [{index: 3, value: 8}, {index: 4, value: 4}, {index: 10, value: 64}, {index: 11, value: 16}, {index: 12, value: 2}]});

      //Send Route KM216.R_DE AVAILABLE - Virtual Route
      sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 52, value: 0}]});

      //Send Route KM216.R_DC AVAILABLE - Real Route
      sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 2, value: 0}]});

      //Send Route KM216.R_DC AVAILABLE - Real Route
      sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 3, value: 0}]});

      //Send Route KM216.WT Occup1 - false
      // sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 12, value: 128}]});
      sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 12, value: 0}]});

      //Send Route KM216.WT Occup2 - false
      // sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 13, value: 8}]});
      sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 13, value: 0}]});

      //Send Route KM209.WT R2_DA - true
      // sendChanges({section: 2, remote: 25, full: false, connected: true, changed: [{index: 2, value: 64}]});
      sendChanges({section: 1, remote: 25, full: false, connected: true, changed: [{index: 2, value: 0}]});

      currentState = STATE['LOCKED_ROUTE']; 
    }
    else if(info.section === 2 && info.remote === 17 && info.port === 2 && info.value === 2) {
      // Cancel Route KM216.R_DC

      console.debug('Cancel route KM216.R_DC received !!!');

      //Send Route KM216.R_DE AVAILABLE - Virtual Route
      sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 52, value: 0}]});

      //Send Route KM216.R_DC AVAILABLE - Real Route
      sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 2, value: 0}]});        

      //Send Route KM216.R_DC AVAILABLE - Real Route
      sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 3, value: 0}]});

      //Send Indication KM216.WT Occup1 - false
      // sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 12, value: 128}]});
      sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 12, value: 0}]});

      //Send Indication KM216.WT Occup2 - false
      // sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 13, value: 8}]});
      sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 13, value: 0}]});

    }
    else if(info.section === 2 && info.remote === 17 && info.port === 1 && info.value === 64) {
        // Requested Route KM216.R_DC
        console.debug('Requested Route KM216.R_DC !!!');

      if(currentState === STATE['LOCKED_ROUTE']) {
        console.debug(' -------- test case: LOCKED_ROUTE started !!!');

        // //Send Route KM216.R_DC GRANTED - Real Route
        // console.debug('Send Route KM216.R_DC GRANTED - Real Route');
        // sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 2, value: 16}, {index: 52, value: 32}]});

        seq_indications = 1;
        setTimeout(() => {
          console.debug('Send Route KM216.R_DE GRANTED - Virtual Route');
          //Send Route KM216.R_DE GRANTED - Virtual Route
          sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 2, value: 16}, {index: 52, value: 32}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;
        setTimeout(() => { 
          console.debug('Send Indication KM216.WT Occup2 = true');
          //Send Indication KM216.WT Occup2 = true
          sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 13, value: 8}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;
        setTimeout(() => {
          console.debug('Send Route KM216.R_DC UNGRANTED - Virtual Route');
          //Send Route KM216.R_DC UNGRANTED - Virtual Route
          sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 2, value: 0}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;
        seq_indications++;
        setTimeout(() => {
          console.debug('Send Indication KM216.WT Occup1 - false');
          //Send Indication KM216.WT Occup1 - false
          sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 12, value: 0}]});

          console.debug('Send Indication KM216.WT Occup2 - false');
          //Send Indication KM216.WT Occup2 - false
          sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 13, value: 0}]});

          //Send Route KM216.R_DE AVAILABLE - Virtual Route
          sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 52, value: 0}]});

          //Send Route KM216.R_DC AVAILABLE - Real Route
          sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 2, value: 0}]});        

          //Send Route KM216.R_DC AVAILABLE - Real Route
          sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 3, value: 0}]});

          currentState = STATE['REAL_ROUTE_GRANTED'];
        }, INDICATION_INTERVAL * seq_indications);
      }
      if(currentState === STATE['REAL_ROUTE_GRANTED']) {
        console.debug(' -------- test case: REAL_ROUTE_GRANTED started !!!');
        //Send Route KM216.R_DC GRANTED - Real Route
        sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 2, value: 16}]});

        seq_indications = 1;
        setTimeout(() => {
          console.debug('Send Route KM216.R_DE REGISTRED - Virtual Route');
          //Send Route KM216.R_DE REGISTRED - Virtual Route
          sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 52, value: 64}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route KM216.R_DE GRANTED - Virtual Route');
          //Send Route KM216.R_DE GRANTED - Virtual Route
          sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 52, value: 32}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route KM216.R_DE AVAILABLE - Virtual Route');
          //Send Route KM216.R_DE AVAILABLE - Virtual Route
          sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 52, value: 0}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route KM216.R_DE GRANTED - Virtual Route');
          //Send Route KM216.R_DE GRANTED - Virtual Route
          sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 52, value: 32}]});

          currentState = STATE['REAL_ROUTE_REGISTERED'];
        }, INDICATION_INTERVAL * seq_indications);
      }
      if(currentState === STATE['REAL_ROUTE_REGISTERED']) {
        console.debug(' -------- test case: REAL_ROUTE_REGISTERED started !!!');

        console.debug('Send Route KM216.R_DC REGISTERED - Real Route');
        //Send Route KM216.R_DC REGISTERED - Real Route
        sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 2, value: 32}]});

        seq_indications = 1;

        setTimeout(() => {
          console.debug('Send Route KM216.R_DE GRANTED - Virtual Route');
          //Send Route KM216.R_DE GRANTED - Virtual Route
          sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 52, value: 32}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route KM216.R_DE REGISTRED - Virtual Route');
          //Send Route KM216.R_DE REGISTRED - Virtual Route
          sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 52, value: 64}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route KM216.R_DE AVAILABLE - Virtual Route');
          //Send Route KM216.R_DE AVAILABLE - Virtual Route
          sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 52, value: 0}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route KM216.R_DE GRANTED - Virtual Route');
          //Send Route KM216.R_DE GRANTED - Virtual Route
          sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 52, value: 32}]});

          currentState = STATE['REAL_ROUTE_TIMELOCKED'];
        }, INDICATION_INTERVAL * seq_indications);
      }      
      if(currentState === STATE['REAL_ROUTE_TIMELOCKED']) {
        console.debug(' -------- test case: REAL_ROUTE_TIMELOCKED started !!!');

        console.debug('Send Route KM216.R_DC GRANTED - Real Route');
        //Send Route KM216.R_DC GRANTED - Real Route
        sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 2, value: 16}]});

        console.debug('Send Route KM216.R_DC TIMELOCKED - Real Route');
        //Send Route KM216.R_DC TIMELOCKED - Real Route
        sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 3, value: 2}]});

        seq_indications = 1;

        setTimeout(() => {
          console.debug('Send Route KM216.R_DE GRANTED - Virtual Route');
          //Send Route KM216.R_DE GRANTED - Virtual Route
          sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 52, value: 32}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route KM216.R_DE REGISTRED - Virtual Route');
          //Send Route KM216.R_DE REGISTRED - Virtual Route
          sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 52, value: 64}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route KM216.R_DE AVAILABLE - Virtual Route');
          //Send Route KM216.R_DE AVAILABLE - Virtual Route
          sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 52, value: 0}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route KM216.R_DC UNTIMELOCKED - Real Route');
          //Send Route KM216.R_DC UNTIMELOCKED - Real Route
          sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 3, value: 0}]});

          console.debug('Send Route KM216.R_DE GRANTED - Virtual Route');
          //Send Route KM216.R_DE GRANTED - Virtual Route
          sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 52, value: 32}]});

          currentState = STATE['VIRTUAL_ROUTE_GRANTED'];
        }, INDICATION_INTERVAL * seq_indications);
      }
      if(currentState === STATE['VIRTUAL_ROUTE_GRANTED']) {
        console.debug(' -------- test case: VIRTUAL_ROUTE_GRANTED started !!!');

        console.debug('Send Route KM216.R_DE GRANTED - Virtual Route');
        //Send Route KM216.R_DE GRANTED - Virtual Route
        sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 52, value: 32}]});

        seq_indications = 1;

        setTimeout(() => {
          console.debug('Send Route KM216.R_DC REGISTERED - Real Route');
          //Send Route KM216.R_DC REGISTERED - Real Route
          sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 2, value: 32}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route KM216.R_DC GRANTED - Real Route');
          //Send Route KM216.R_DC GRANTED - Real Route
          sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 2, value: 16}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route KM216.R_DC TIMELOCKED - Real Route');
          //Send Route KM216.R_DC TIMELOCKED - Real Route
          sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 3, value: 2}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;
        setTimeout(() => {
          console.debug('Send Route KM216.R_DC UNTIMELOCKED - Real Route');
          //Send Route KM216.R_DC UNTIMELOCKED - Real Route
          sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 3, value: 0}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;
        setTimeout(() => {
          console.debug('Send Route KM216.R_DC AVAILABLE - Real Route');
          //Send Route KM216.R_DC AVAILABLE - Real Route
          sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 2, value: 0}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route KM216.R_DC GRANTED - Real Route');
          //Send Route KM216.R_DC GRANTED - Real Route
          sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 2, value: 16}]});

          currentState = STATE['VIRTUAL_ROUTE_REGISTERED'];
        }, INDICATION_INTERVAL * seq_indications);
      }      
      if(currentState === STATE['VIRTUAL_ROUTE_REGISTERED']) {
        console.debug(' -------- test case: VIRTUAL_ROUTE_REGISTERED started !!!');

        console.debug('Send Route KM216.R_DE REGISTRED - Virtual Route');
        //Send Route KM216.R_DE REGISTRED - Virtual Route
        sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 52, value: 64}]});

        seq_indications = 1;

        setTimeout(() => {
        console.debug('Send Route KM216.R_DC GRANTED - Real Route');
        //Send Route KM216.R_DC GRANTED - Real Route
        sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 2, value: 16}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route KM216.R_DC REGISTERED - Real Route');
          //Send Route KM216.R_DC REGISTERED - Real Route
          sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 2, value: 32}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route KM216.R_DC TIMELOCKED - Real Route');
          //Send Route KM216.R_DC TIMELOCKED - Real Route
          sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 3, value: 2}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route KM216.R_DC UNTIMELOCKED - Real Route');
          //Send Route KM216.R_DC UNTIMELOCKED - Real Route
          sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 3, value: 0}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route KM216.R_DC AVAILABLE - Real Route');
          //Send Route KM216.R_DC AVAILABLE - Real Route
          sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 2, value: 0}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route KM216.R_DC GRANTED - Real Route');
          //Send Route KM216.R_DC GRANTED - Real Route
          sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 2, value: 16}]});

          currentState = STATE['VIRTUAL_ROUTE_AVAILABLE'];
        }, INDICATION_INTERVAL * seq_indications);
      }
      if(currentState === STATE['VIRTUAL_ROUTE_AVAILABLE']) {
        console.debug(' -------- test case: VIRTUAL_ROUTE_AVAILABLE started !!!');

        seq_indications++;
        setTimeout(() => {
          console.debug('Send Route KM216.R_DC REGISTERED - Real Route');
          //Send Route KM216.R_DC REGISTERED - Real Route
          sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 2, value: 32}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications = 1;
        setTimeout(() => {
          console.debug('Send Route KM216.R_DC GRANTED - Real Route');
          //Send Route KM216.R_DC GRANTED - Real Route
          sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 2, value: 16}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route KM216.R_DC TIMELOCKED - Real Route');
          //Send Route KM216.R_DC TIMELOCKED - Real Route
          sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 3, value: 2}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route KM216.R_DC UNTIMELOCKED - Real Route');
          //Send Route KM216.R_DC UNTIMELOCKED - Real Route
          sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 3, value: 0}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route KM216.R_DC AVAILABLE - Real Route');
          //Send Route KM216.R_DC AVAILABLE - Real Route
          sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 2, value: 0}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route KM216.R_DC GRANTED - Real Route');
          //Send Route KM216.R_DC GRANTED - Real Route
          sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 2, value: 16}]});

          //sendChanges({section: 2, remote: 17, full: false, connected: false, changed: []});

          currentState = STATE['REAL_ROUTE_GRANTED'];
        }, INDICATION_INTERVAL * seq_indications);
      }      
    }
  }
}

startTestCase(onDataReceived);