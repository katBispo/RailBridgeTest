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

// Testar rota composta

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

      //Send Route KM512.WT Occup1 - false
      // sendChanges({section: 3, remote: 15, full: false, connected: true, changed: [{index: 12, value: 128}]});
      sendChanges({section: 3, remote: 15, full: false, connected: true, changed: [{index: 12, value: 0}]});

      //Send Route KM512.WT Occup2 - false
      // sendChanges({section: 3, remote: 15, full: false, connected: true, changed: [{index: 13, value: 8}]});
      sendChanges({section: 3, remote: 15, full: false, connected: true, changed: [{index: 13, value: 0}]});

      sendChanges({section: 3, remote: 15, full: false, connected: true, changed: [{index: 12, value: 34}, {index: 11, value: 16}]});
      sendChanges({section: 4, remote: 20, full: false, connected: true, changed: [{index: 10, value: 64}, {index: 11, value: 8}, {index: 12, value: 32}]});

      currentState = STATE['LOCKED_ROUTE']; 
    }
    else if(info.section === 3 && info.remote === 15 && info.port === 2 && info.value === 1) {
      // Cancel Route KM512.R_AE

      console.debug('Cancel route KM512.R_AE received !!!');

      //Send Route KM512.R_AE AVAILABLE - Virtual Route
      sendChanges({section: 3, remote: 15, full: false, connected: true, changed: [{index: 52, value: 0}, {index: 53, value: 0}]});

      //Send Route KM512.R_CD AVAILABLE - Real Route
      sendChanges({section: 3, remote: 15, full: false, connected: true, changed: [{index: 1, value: 0}, {index: 2, value: 0}, {index: 3, value: 0}]});
    }
    else if(info.section === 3 && info.remote === 15 && info.port === 1 && info.value === 2) {
      // Requested Route KM512.R_AE
      console.debug('Requested Route KM512.R_AE !!!');

      if(currentState === STATE['LOCKED_ROUTE']) {
        console.debug(' -------- test case: LOCKED_ROUTE started !!!');

        //Send Route KM512.R_AD GRANTED - Real Route
        // console.debug('Send Route KM512.R_AD GRANTED - Real Route');
        // sendChanges({section: 3, remote: 15, full: false, connected: true, changed: [{index: 1, value: 4}]});
  
        seq_indications = 1;
        setTimeout(() => {
          console.debug('Send Route KM512.R_AE GRANTED - Virtual Route');
          //Send Route KM512.R_AE GRANTED - Virtual Route
          sendChanges({section: 3, remote: 15, full: false, connected: true, changed: [{index: 1, value: 4}, {index: 52, value: 128}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;
        setTimeout(() => { 
          console.debug('Send Indication KM512.WT Occup1 = true');
          //Send Indication KM512.WT Occup1 = true
          sendChanges({section: 3, remote: 15, full: false, connected: true, changed: [{index: 12, value: 162}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;
        setTimeout(() => {
          console.debug('Send Route KM512.R_AD UNGRANTED - Real Route');
          //Send Route KM512.R_AD UNGRANTED - Real Route
          sendChanges({section: 3, remote: 15, full: false, connected: true, changed: [{index: 1, value: 0}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;
        seq_indications++;
        setTimeout(() => {
          console.debug('Send Indication KM512.WT Occup1 = false');
          //Send Indication KM512.WT Occup1 = false
          sendChanges({section: 3, remote: 15, full: false, connected: true, changed: [{index: 12, value: 34}]});

          //Send Route KM512.R_AE AVAILABLE - Virtual Route
          sendChanges({section: 3, remote: 15, full: false, connected: true, changed: [{index: 52, value: 0}, {index: 53, value: 0}]});

          //Send Route KM512.R_AD AVAILABLE - Real Route
          sendChanges({section: 3, remote: 15, full: false, connected: true, changed: [{index: 1, value: 0}]});

          currentState = STATE['REAL_ROUTE_GRANTED'];
        }, INDICATION_INTERVAL * seq_indications);
      }
      if(currentState === STATE['REAL_ROUTE_GRANTED']) {
        console.debug(' -------- test case: REAL_ROUTE_GRANTED started !!!');

        console.debug('Send Route KM512.R_AD GRANTED - Real Route');
        //Send Route KM512.R_AD GRANTED - Real Route
        sendChanges({section: 3, remote: 15, full: false, connected: true, changed: [{index: 1, value: 4}]});

        seq_indications = 1;

        setTimeout(() => {
          console.debug('Send Route KM512.R_AE GRANTED - Virtual Route');
          //Send Route KM512.R_AE GRANTED - Virtual Route
          sendChanges({section: 3, remote: 15, full: false, connected: true, changed: [{index: 52, value: 128}, {index: 53, value: 0}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;
        setTimeout(() => {
          console.debug('Send Route KM512.R_AE REGISTRED - Virtual Route');
          //Send Route KM512.R_AE REGISTRED - Virtual Route
          sendChanges({section: 3, remote: 15, full: false, connected: true, changed: [{index: 52, value: 0}, {index: 53, value: 1}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;
        setTimeout(() => {
          console.debug('Send Route KM512.R_AE AVAILABLE - Virtual Route');
          //Send Route KM512.R_AE AVAILABLE - Virtual Route
          sendChanges({section: 3, remote: 15, full: false, connected: true, changed: [{index: 52, value: 0}, {index: 53, value: 0}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;
        setTimeout(() => {
          console.debug('Send Route KM512.R_AE GRANTED - Virtual Route');
          //Send Route KM512.R_AE GRANTED - Virtual Route
          sendChanges({section: 3, remote: 15, full: false, connected: true, changed: [{index: 52, value: 128}, {index: 53, value: 0}]});

          currentState = STATE['REAL_ROUTE_REGISTERED'];
        }, INDICATION_INTERVAL * seq_indications);
      }
      if(currentState === STATE['REAL_ROUTE_REGISTERED']) {
        console.debug(' -------- test case: REAL_ROUTE_REGISTERED started !!!');

        console.debug('Send Route KM512.R_AD REGISTERED - Real Route');
        //Send Route KM512.R_AD REGISTERED - Real Route
        sendChanges({section: 3, remote: 15, full: false, connected: true, changed: [{index: 1, value: 8}]});

        seq_indications = 1;

        setTimeout(() => {
          console.debug('Send Route KM512.R_AE GRANTED - Virtual Route');
          //Send Route KM512.R_AE GRANTED - Virtual Route
          sendChanges({section: 3, remote: 15, full: false, connected: true, changed: [{index: 52, value: 128}, {index: 53, value: 0}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;
        setTimeout(() => {
          console.debug('Send Route KM512.R_AE REGISTRED - Virtual Route');
          //Send Route KM512.R_AE REGISTRED - Virtual Route
          sendChanges({section: 3, remote: 15, full: false, connected: true, changed: [{index: 52, value: 0}, {index: 53, value: 1}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;
        setTimeout(() => {
          console.debug('Send Route KM512.R_AE AVAILABLE - Virtual Route');
          //Send Route KM512.R_AE AVAILABLE - Virtual Route
          sendChanges({section: 3, remote: 15, full: false, connected: true, changed: [{index: 52, value: 0}, {index: 53, value: 0}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;
        setTimeout(() => {
          console.debug('Send Route KM512.R_AE GRANTED - Virtual Route');
          //Send Route KM512.R_AE GRANTED - Virtual Route
          sendChanges({section: 3, remote: 15, full: false, connected: true, changed: [{index: 52, value: 128}, {index: 53, value: 0}]});

          currentState = STATE['REAL_ROUTE_TIMELOCKED'];
        }, INDICATION_INTERVAL * seq_indications);
      }      
      if(currentState === STATE['REAL_ROUTE_TIMELOCKED']) {
        console.debug(' -------- test case: REAL_ROUTE_TIMELOCKED started !!!');

        console.debug('Send Route KM512.R_AD GRANTED - Real Route');
        //Send Route KM512.R_AD GRANTED - Real Route
        sendChanges({section: 3, remote: 15, full: false, connected: true, changed: [{index: 1, value: 4}]});

        console.debug('Send Route KM512.R_AD TIMELOCKED - Real Route');
        //Send Route KM512.R_AD TIMELOCKED - Real Route
        sendChanges({section: 3, remote: 15, full: false, connected: true, changed: [{index: 3, value: 1}]});

        seq_indications = 1;

        setTimeout(() => {
          console.debug('Send Route KM512.R_AE GRANTED - Virtual Route');
          //Send Route KM512.R_AE GRANTED - Virtual Route
          sendChanges({section: 3, remote: 15, full: false, connected: true, changed: [{index: 52, value: 128}, {index: 53, value: 0}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;
        setTimeout(() => {
          console.debug('Send Route KM512.R_AE REGISTRED - Virtual Route');
          //Send Route KM512.R_AE REGISTRED - Virtual Route
          sendChanges({section: 3, remote: 15, full: false, connected: true, changed: [{index: 52, value: 0}, {index: 53, value: 1}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;
        setTimeout(() => {
          console.debug('Send Route KM512.R_AE AVAILABLE - Virtual Route');
          //Send Route KM512.R_AE AVAILABLE - Virtual Route
          sendChanges({section: 3, remote: 15, full: false, connected: true, changed: [{index: 52, value: 0}, {index: 53, value: 0}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;
        setTimeout(() => {
          console.debug('Send Route KM512.R_AD UNTIMELOCKED - Real Route');
          //Send Route KM512.R_AD UNTIMELOCKED - Real Route
          sendChanges({section: 3, remote: 15, full: false, connected: true, changed: [{index: 3, value: 0}]});
  
          console.debug('Send Route KM512.R_AE GRANTED - Virtual Route');
          //Send Route KM512.R_AE GRANTED - Virtual Route
          sendChanges({section: 3, remote: 15, full: false, connected: true, changed: [{index: 52, value: 128}, {index: 53, value: 0}]});

          currentState = STATE['VIRTUAL_ROUTE_GRANTED'];
        }, INDICATION_INTERVAL * seq_indications);
      }
      if(currentState === STATE['VIRTUAL_ROUTE_GRANTED']) {
        console.debug(' -------- test case: VIRTUAL_ROUTE_GRANTED started !!!');

        console.debug('Send Route KM512.R_AE GRANTED - Virtual Route');
        //Send Route KM512.R_AE GRANTED - Virtual Route
        sendChanges({section: 3, remote: 15, full: false, connected: true, changed: [{index: 52, value: 128}, {index: 53, value: 0}]});

        seq_indications = 1;

        setTimeout(() => {
            console.debug('Send Route KM512.R_AD GRANTED - Real Route');
            //Send Route KM512.R_AD GRANTED - Real Route
            sendChanges({section: 3, remote: 15, full: false, connected: true, changed: [{index: 1, value: 4}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;
        setTimeout(() => {
          console.debug('Send Route KM512.R_AD TIMELOCKED - Real Route');
          //Send Route KM512.R_AD TIMELOCKED - Real Route
          sendChanges({section: 3, remote: 15, full: false, connected: true, changed: [{index: 3, value: 1}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;
        setTimeout(() => {
          console.debug('Send Route KM512.R_AD UNTIMELOCKED - Real Route');
          //Send Route KM512.R_AD UNTIMELOCKED - Real Route
          sendChanges({section: 3, remote: 15, full: false, connected: true, changed: [{index: 3, value: 0}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;
        setTimeout(() => {
          console.debug('Send Route KM512.R_AD REGISTERED - Real Route');
          //Send Route KM512.R_AD REGISTERED - Real Route
          sendChanges({section: 3, remote: 15, full: false, connected: true, changed: [{index: 1, value: 8}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;
        setTimeout(() => {
          console.debug('Send Route KM512.R_AD AVAILABLE - Real Route');
          //Send Route KM512.R_AD AVAILABLE - Real Route
          sendChanges({section: 3, remote: 15, full: false, connected: true, changed: [{index: 1, value: 0}]});

        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;
        setTimeout(() => {
          console.debug('Send Route KM512.R_AD GRANTED - Real Route');
          //Send Route KM512.R_AD GRANTED - Real Route
          sendChanges({section: 3, remote: 15, full: false, connected: true, changed: [{index: 1, value: 4}]});

          currentState = STATE['VIRTUAL_ROUTE_REGISTERED'];
        }, INDICATION_INTERVAL * seq_indications);
      }      
      if(currentState === STATE['VIRTUAL_ROUTE_REGISTERED']) {
        console.debug(' -------- test case: VIRTUAL_ROUTE_REGISTERED started !!!');

        console.debug('Send Route KM512.R_AE REGISTRED - Virtual Route');
        //Send Route KM512.R_AE REGISTRED - Virtual Route
        sendChanges({section: 3, remote: 15, full: false, connected: true, changed: [{index: 52, value: 0}, {index: 53, value: 1}]});

        seq_indications = 1;

        setTimeout(() => {
          console.debug('Send Route KM512.R_AD GRANTED - Real Route');
          //Send Route KM512.R_AD GRANTED - Real Route
          sendChanges({section: 3, remote: 15, full: false, connected: true, changed: [{index: 1, value: 4}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;
        setTimeout(() => {
          console.debug('Send Route KM512.R_AD REGISTERED - Real Route');
          //Send Route KM512.R_AD REGISTERED - Real Route
          sendChanges({section: 3, remote: 15, full: false, connected: true, changed: [{index: 1, value: 8}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;
        setTimeout(() => {
          console.debug('Send Route KM512.R_AD TIMELOCKED - Real Route');
          //Send Route KM512.R_AD TIMELOCKED - Real Route
          sendChanges({section: 3, remote: 15, full: false, connected: true, changed: [{index: 3, value: 1}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;
        setTimeout(() => {
          console.debug('Send Route KM512.R_AD UNTIMELOCKED - Real Route');
          //Send Route KM512.R_AD UNTIMELOCKED - Real Route
          sendChanges({section: 3, remote: 15, full: false, connected: true, changed: [{index: 3, value: 0}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;
        setTimeout(() => {
          console.debug('Send Route KM512.R_AD AVAILABLE - Real Route');
          //Send Route KM512.R_AD AVAILABLE - Real Route
          sendChanges({section: 3, remote: 15, full: false, connected: true, changed: [{index: 1, value: 0}]});

        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;
        setTimeout(() => {
          console.debug('Send Route KM512.R_AD GRANTED - Real Route');
          //Send Route KM512.R_AD GRANTED - Real Route
          sendChanges({section: 3, remote: 15, full: false, connected: true, changed: [{index: 1, value: 4}]});

          currentState = STATE['VIRTUAL_ROUTE_AVAILABLE'];
        }, INDICATION_INTERVAL * seq_indications);
      }
      if(currentState === STATE['VIRTUAL_ROUTE_AVAILABLE']) {
        console.debug(' -------- test case: VIRTUAL_ROUTE_AVAILABLE started !!!');

        seq_indications = 1;

        setTimeout(() => {
          console.debug('Send Route KM512.R_AD GRANTED - Real Route');
          //Send Route KM512.R_AD GRANTED - Real Route
          sendChanges({section: 3, remote: 15, full: false, connected: true, changed: [{index: 1, value: 4}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;
        setTimeout(() => {
          console.debug('Send Route KM512.R_AD REGISTERED - Real Route');
          //Send Route KM512.R_AD REGISTERED - Real Route
          sendChanges({section: 3, remote: 15, full: false, connected: true, changed: [{index: 1, value: 8}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;
        setTimeout(() => {
          console.debug('Send Route KM512.R_AD TIMELOCKED - Real Route');
          //Send Route KM512.R_AD TIMELOCKED - Real Route
          sendChanges({section: 3, remote: 15, full: false, connected: true, changed: [{index: 3, value: 1}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;
        setTimeout(() => {
          console.debug('Send Route KM512.R_AD UNTIMELOCKED - Real Route');
          //Send Route KM512.R_AD UNTIMELOCKED - Real Route
          sendChanges({section: 3, remote: 15, full: false, connected: true, changed: [{index: 3, value: 0}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route KM512.R_AD AVAILABLE - Real Route');
          //Send Route KM512.R_AD AVAILABLE - Real Route
          sendChanges({section: 3, remote: 15, full: false, connected: true, changed: [{index: 1, value: 0}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route KM512.R_AD GRANTED - Real Route');
          //Send Route KM512.R_AD GRANTED - Real Route
          sendChanges({section: 3, remote: 15, full: false, connected: true, changed: [{index: 1, value: 4}]});

          currentState = STATE['LOCKED_ROUTE'];
        }, INDICATION_INTERVAL * seq_indications);
      }      
    }
  }
}

startTestCase(onDataReceived);