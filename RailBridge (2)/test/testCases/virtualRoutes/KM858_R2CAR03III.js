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
      //Send Routes AVAILABLE
      sendChanges({section: 5, remote: 25, full: false, connected: true, changed: [{index: 52, value: 0}, {index: 53, value: 0}]});
      sendChanges({section: 5, remote: 25, full: false, connected: true, changed: [{index: 2, value: 0}, {index: 2, value: 0}, {index: 3, value: 0}]});
      sendChanges({section: 5, remote: 12, full: false, connected: true, changed: [{index: 50, value: 0}, {index: 52, value: 0}, {index: 53, value: 0}]});
      sendChanges({section: 5, remote: 12, full: false, connected: true, changed: [{index: 2, value: 0}, {index: 2, value: 0}, {index: 3, value: 0}]});

      //Send Route Initial indications
      sendChanges({section: 5, remote: 25, full: false, connected: true, changed: [{index: 12, value: 0}]});
      sendChanges({section: 5, remote: 25, full: false, connected: true, changed: [{index: 4, value: 128}]});
      sendChanges({section: 5, remote: 25, full: false, connected: true, changed: [{index: 5, value: 64}]});
      sendChanges({section: 5, remote: 25, full: false, connected: true, changed: [{index: 10, value: 128}]});
      sendChanges({section: 5, remote: 25, full: false, connected: true, changed: [{index: 13, value: 0}]});
      sendChanges({section: 5, remote: 25, full: false, connected: true, changed: [{index: 20, value: 0}]});
      sendChanges({section: 5, remote: 25, full: false, connected: true, changed: [{index: 50, value: 0}]});
      sendChanges({section: 5, remote: 12, full: false, connected: true, changed: [{index: 10, value: 128}]});
      sendChanges({section: 5, remote: 12, full: false, connected: true, changed: [{index: 4, value: 128}, {index: 5, value: 64}]});
      sendChanges({section: 5, remote: 12, full: false, connected: true, changed: [{index: 13, value: 0}]});
      sendChanges({section: 5, remote: 12, full: false, connected: true, changed: [{index: 20, value: 0}]});
      sendChanges({section: 5, remote: 12, full: false, connected: true, changed: [{index: 15, value: 0}]});
      // sendChanges({section: 5, remote: 12, full: false, connected: true, changed: [{index: 50, value: 64}]});

      // AMV occupaed
      // sendChanges({section: 5, remote: 25, full: false, connected: true, changed: [{index: 12, value: 128}]});

      // Route Granted
      // sendChanges({section: 5, remote: 25, full: false, connected: true, changed: [{index: 52, value: 32}]});

      // CDV 3D1T unOccupied
      // sendChanges({section: 5, remote: 25, full: false, connected: true, changed: [{index: 50, value: 64}]});

      //Send AMV6 and AMV7 Normal
      sendChanges({section: 5, remote: 25, full: false, connected: true, changed: [{index: 52, value: 24}]});

      //Send AMV6 and AMV7 Normal
      sendChanges({section: 5, remote: 12, full: false, connected: true, changed: [{index: 11, value: 72}]});

      //Send AMV8, AMV12 and AMV25 Normal
      sendChanges({section: 5, remote: 12, full: false, connected: true, changed: [{index: 50, value: 14}]});

      currentState = STATE['LOCKED_ROUTE']; 
    }
    else if(info.section === 5 && info.remote === 25 && info.port === 2 && info.value === 1) {
      // Cancel Route

      console.debug('Cancel route received !!!');

      //Send Route AVAILABLE - Real Route
      sendChanges({section: 5, remote: 25, full: false, connected: true, changed: [{index: 1, value: 0}, {index: 2, value: 0}, {index: 3, value: 0}]});

      //Send AMV6 and AMV7 Normal
      sendChanges({section: 5, remote: 25, full: false, connected: true, changed: [{index: 52, value: 24}]});
    }
    else if(info.section === 5 && info.remote === 25 && info.port === 26 && info.value === 1) {
      // Block

      console.debug('Block segment received !!!');

      // Send Block Segment
      sendChanges({section: 5, remote: 25, full: false, connected: true, changed: [{index: 50, value: 128}]});
    }
    else if(info.section === 5 && info.remote === 25 && info.port === 26 && info.value === 2) {
      // UnBlock

      console.debug('UnBlock segment received !!!');

      // Send UnBlockConf Segment
      sendChanges({section: 5, remote: 25, full: false, connected: true, changed: [{index: 51, value: 1}]});
    }
    else if(info.section === 5 && info.remote === 25 && info.port === 26 && info.value === 4) {
      // UnBlock conf

      console.debug('UnBlock confirm segment received !!!');

      // Send UnBlock Segment
      sendChanges({section: 5, remote: 25, full: false, connected: true, changed: [{index: 50, value: 0}]});
    }
    else if(info.section === 5 && info.remote === 25 && info.port === 1 && info.value === 8) {
      // Requested Route
      console.debug('Requested Route !!!');

      if(currentState === STATE['LOCKED_ROUTE']) {
        console.debug(' -------- test case: LOCKED_ROUTE started !!!');

        // Send Route GRANTED - Real Route
        // console.debug('Send Route GRANTED - Real Route');
        // sendChanges({section: 5, remote: 25, full: false, connected: true, changed: [{index: 1, value: 64}]});
  
        seq_indications = 1;
        setTimeout(() => {
          console.debug('Send Route GRANTED - Virtual Route');
          //Send Route KM512.R_CE GRANTED - Virtual Route
          sendChanges({section: 5, remote: 25, full: false, connected: true, changed: [{index: 1, value: 64}, {index: 52, value: 152}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;
        setTimeout(() => { 
          console.debug('Send Indication WT Occup = true');
          //Send Indication WT Occup = true
          sendChanges({section: 5, remote: 25, full: false, connected: true, changed: [{index: 12, value: 128}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;
        setTimeout(() => {
          console.debug('Send Route UNGRANTED - Real Route');
          //Send Route UNGRANTED - Real Route
          sendChanges({section: 5, remote: 25, full: false, connected: true, changed: [{index: 1, value: 0}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;
        seq_indications++;
        setTimeout(() => {
          console.debug('Send Indication Occup1 = false');
          //Send Indication Occup2 = false
          sendChanges({section: 5, remote: 25, full: false, connected: true, changed: [{index: 12, value: 0}]});

          //Send Route AVAILABLE - Virtual Route
          sendChanges({section: 5, remote: 25, full: false, connected: true, changed: [{index: 52, value: 24}]});

          //Send Route AVAILABLE - Real Route
          sendChanges({section: 5, remote: 25, full: false, connected: true, changed: [{index: 1, value: 0}]});

          currentState = STATE['REAL_ROUTE_GRANTED'];
        }, INDICATION_INTERVAL * seq_indications);
      }
      if(currentState === STATE['REAL_ROUTE_GRANTED']) {
        console.debug(' -------- test case: REAL_ROUTE_GRANTED started !!!');

        console.debug('Send Route GRANTED - Real Route');
        //Send Route GRANTED - Real Route
        sendChanges({section: 5, remote: 25, full: false, connected: true, changed: [{index: 1, value: 64}]});

        seq_indications = 1;

        setTimeout(() => {
          console.debug('Send Route GRANTED - Virtual Route');
          //Send Route GRANTED - Virtual Route
          sendChanges({section: 5, remote: 25, full: false, connected: true, changed: [{index: 52, value: 152}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;
        setTimeout(() => {
          console.debug('Send Route REGISTRED - Virtual Route');
          //Send Route REGISTRED - Virtual Route
          sendChanges({section: 5, remote: 25, full: false, connected: true, changed: [{index: 52, value: 28}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;
        setTimeout(() => {
          console.debug('Send Route AVAILABLE - Virtual Route');
          //Send Route AVAILABLE - Virtual Route
          sendChanges({section: 5, remote: 25, full: false, connected: true, changed: [{index: 52, value: 24}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;
        setTimeout(() => {
          console.debug('Send Route GRANTED - Virtual Route');
          //Send Route GRANTED - Virtual Route
          sendChanges({section: 5, remote: 25, full: false, connected: true, changed: [{index: 52, value: 152}]});

          currentState = STATE['REAL_ROUTE_REGISTERED'];
        }, INDICATION_INTERVAL * seq_indications);
      }
      if(currentState === STATE['REAL_ROUTE_REGISTERED']) {
        console.debug(' -------- test case: REAL_ROUTE_REGISTERED started !!!');

        console.debug('Send Route REGISTERED - Real Route');
        //Send Route REGISTERED - Real Route
        sendChanges({section: 5, remote: 25, full: false, connected: true, changed: [{index: 1, value: 128}]});

        seq_indications = 1;

        setTimeout(() => {
          console.debug('Send Route GRANTED - Virtual Route');
          //Send Route GRANTED - Virtual Route
          sendChanges({section: 5, remote: 25, full: false, connected: true, changed: [{index: 52, value: 152}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;
        setTimeout(() => {
          console.debug('Send Route REGISTRED - Virtual Route');
          //Send Route REGISTRED - Virtual Route
          sendChanges({section: 5, remote: 25, full: false, connected: true, changed: [{index: 52, value: 28}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;
        setTimeout(() => {
          console.debug('Send Route AVAILABLE - Virtual Route');
          //Send Route AVAILABLE - Virtual Route
          sendChanges({section: 5, remote: 25, full: false, connected: true, changed: [{index: 52, value: 24}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;
        setTimeout(() => {
          console.debug('Send Route GRANTED - Virtual Route');
          //Send Route GRANTED - Virtual Route
          sendChanges({section: 5, remote: 25, full: false, connected: true, changed: [{index: 52, value: 152}]});

          currentState = STATE['REAL_ROUTE_TIMELOCKED'];
        }, INDICATION_INTERVAL * seq_indications);
      }      
      if(currentState === STATE['REAL_ROUTE_TIMELOCKED']) {
        console.debug(' -------- test case: REAL_ROUTE_TIMELOCKED started !!!');

        console.debug('Send Route GRANTED - Real Route');
        //Send Route GRANTED - Real Route
        sendChanges({section: 5, remote: 25, full: false, connected: true, changed: [{index: 1, value: 64}]});

        seq_indications = 1;

        setTimeout(() => {
          console.debug('Send Route TIMELOCKED - Real Route');
          //Send Route TIMELOCKED - Real Route
          sendChanges({section: 5, remote: 25, full: false, connected: true, changed: [{index: 3, value: 1}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;
        setTimeout(() => {
          console.debug('Send Route GRANTED - Virtual Route');
          //Send Route GRANTED - Virtual Route
          sendChanges({section: 5, remote: 25, full: false, connected: true, changed: [{index: 52, value: 152}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;
        setTimeout(() => {
          console.debug('Send Route REGISTRED - Virtual Route');
          //Send Route REGISTRED - Virtual Route
          sendChanges({section: 5, remote: 25, full: false, connected: true, changed: [{index: 52, value: 28}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;
        setTimeout(() => {
          console.debug('Send Route AVAILABLE - Virtual Route');
          //Send Route AVAILABLE - Virtual Route
          sendChanges({section: 5, remote: 25, full: false, connected: true, changed: [{index: 52, value: 24}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;
        setTimeout(() => {
          console.debug('Send Route UNTIMELOCKED - Real Route');
          //Send Route UNTIMELOCKED - Real Route
          sendChanges({section: 5, remote: 25, full: false, connected: true, changed: [{index: 3, value: 0}]});
  
          console.debug('Send Route GRANTED - Virtual Route');
          //Send Route GRANTED - Virtual Route
          sendChanges({section: 5, remote: 25, full: false, connected: true, changed: [{index: 52, value: 152}]});

          currentState = STATE['VIRTUAL_ROUTE_GRANTED'];
        }, INDICATION_INTERVAL * seq_indications);
      }
      if(currentState === STATE['VIRTUAL_ROUTE_GRANTED']) {
        console.debug(' -------- test case: VIRTUAL_ROUTE_GRANTED started !!!');

        console.debug('Send Route GRANTED - Virtual Route');
        //Send Route GRANTED - Virtual Route
        sendChanges({section: 5, remote: 25, full: false, connected: true, changed: [{index: 52, value: 152}]});

        seq_indications = 1;

        setTimeout(() => {
            console.debug('Send Route GRANTED - Real Route');
            //Send Route GRANTED - Real Route
            sendChanges({section: 5, remote: 25, full: false, connected: true, changed: [{index: 1, value: 64}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;
        setTimeout(() => {
          console.debug('Send Route TIMELOCKED - Real Route');
          //Send Route TIMELOCKED - Real Route
          sendChanges({section: 5, remote: 25, full: false, connected: true, changed: [{index: 3, value: 1}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;
        setTimeout(() => {
          console.debug('Send Route UNTIMELOCKED - Real Route');
          //Send Route UNTIMELOCKED - Real Route
          sendChanges({section: 5, remote: 25, full: false, connected: true, changed: [{index: 3, value: 0}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;
        setTimeout(() => {
          console.debug('Send Route REGISTERED - Real Route');
          //Send Route REGISTERED - Real Route
          sendChanges({section: 5, remote: 25, full: false, connected: true, changed: [{index: 1, value: 128}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;
        setTimeout(() => {
          console.debug('Send Route AVAILABLE - Real Route');
          //Send Route AVAILABLE - Real Route
          sendChanges({section: 5, remote: 25, full: false, connected: true, changed: [{index: 1, value: 0}]});

        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;
        setTimeout(() => {
          console.debug('Send Route GRANTED - Real Route');
          //Send Route GRANTED - Real Route
          sendChanges({section: 5, remote: 25, full: false, connected: true, changed: [{index: 1, value: 64}]});

          currentState = STATE['VIRTUAL_ROUTE_REGISTERED'];
        }, INDICATION_INTERVAL * seq_indications);
      }      
      if(currentState === STATE['VIRTUAL_ROUTE_REGISTERED']) {
        console.debug(' -------- test case: VIRTUAL_ROUTE_REGISTERED started !!!');

        console.debug('Send Route REGISTRED - Virtual Route');
        //Send Route REGISTRED - Virtual Route
        sendChanges({section: 5, remote: 25, full: false, connected: true, changed: [{index: 52, value: 28}]});

        seq_indications = 1;

        setTimeout(() => {
          console.debug('Send Route GRANTED - Real Route');
          //Send Route GRANTED - Real Route
          sendChanges({section: 5, remote: 25, full: false, connected: true, changed: [{index: 1, value: 64}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;
        setTimeout(() => {
          console.debug('Send Route REGISTERED - Real Route');
          //Send Route REGISTERED - Real Route
          sendChanges({section: 5, remote: 25, full: false, connected: true, changed: [{index: 1, value: 128}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;
        setTimeout(() => {
          console.debug('Send Route TIMELOCKED - Real Route');
          //Send Route TIMELOCKED - Real Route
          sendChanges({section: 5, remote: 25, full: false, connected: true, changed: [{index: 3, value: 1}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;
        setTimeout(() => {
          console.debug('Send Route UNTIMELOCKED - Real Route');
          //Send Route UNTIMELOCKED - Real Route
          sendChanges({section: 5, remote: 25, full: false, connected: true, changed: [{index: 3, value: 0}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;
        setTimeout(() => {
          console.debug('Send Route AVAILABLE - Real Route');
          //Send Route AVAILABLE - Real Route
          sendChanges({section: 5, remote: 25, full: false, connected: true, changed: [{index: 1, value: 0}]});

        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;
        setTimeout(() => {
          console.debug('Send Route GRANTED - Real Route');
          //Send Route GRANTED - Real Route
          sendChanges({section: 5, remote: 25, full: false, connected: true, changed: [{index: 1, value: 64}]});

          currentState = STATE['VIRTUAL_ROUTE_AVAILABLE'];
        }, INDICATION_INTERVAL * seq_indications);
      }
      if(currentState === STATE['VIRTUAL_ROUTE_AVAILABLE']) {
        console.debug(' -------- test case: VIRTUAL_ROUTE_AVAILABLE started !!!');

        seq_indications = 1;

        setTimeout(() => {
          console.debug('Send Route GRANTED - Real Route');
          //Send Route GRANTED - Real Route
          sendChanges({section: 5, remote: 25, full: false, connected: true, changed: [{index: 1, value: 64}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;
        setTimeout(() => {
          console.debug('Send Route REGISTERED - Real Route');
          //Send Route REGISTERED - Real Route
          sendChanges({section: 5, remote: 25, full: false, connected: true, changed: [{index: 1, value: 128}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;
        setTimeout(() => {
          console.debug('Send Route TIMELOCKED - Real Route');
          //Send Route TIMELOCKED - Real Route
          sendChanges({section: 5, remote: 25, full: false, connected: true, changed: [{index: 3, value: 1}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;
        setTimeout(() => {
          console.debug('Send Route UNTIMELOCKED - Real Route');
          //Send Route UNTIMELOCKED - Real Route
          sendChanges({section: 5, remote: 25, full: false, connected: true, changed: [{index: 3, value: 0}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route AVAILABLE - Real Route');
          //Send Route AVAILABLE - Real Route
          sendChanges({section: 5, remote: 25, full: false, connected: true, changed: [{index: 1, value: 0}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;
        setTimeout(() => {
          console.debug('Send Route GRANTED - Real Route');
          //Send Route KM512.R_CD GRANTED - Real Route
          sendChanges({section: 5, remote: 25, full: false, connected: true, changed: [{index: 1, value: 64}]});

        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;
        setTimeout(() => {
          console.debug('Send CDV 3D1T Occupied');
          //Send CDV 3D1T Occupied
          sendChanges({section: 5, remote: 25, full: false, connected: true, changed: [{index: 50, value: 32}]});

        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;
        setTimeout(() => {
          console.debug('Send CDV 3D1T Not Occupied');
          //Send CDV 3D1T Occupied
          sendChanges({section: 5, remote: 25, full: false, connected: true, changed: [{index: 50, value: 0}]});

        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;
        setTimeout(() => {
          console.debug('Send AMV6 Not Normal');
          //Send AMV6 Not Normal
          sendChanges({section: 5, remote: 25, full: false, connected: true, changed: [{index: 52, value: 16}]});

        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;
        setTimeout(() => {
          console.debug('Send AMV6 Normal');
          //Send AMV6 Normal
          sendChanges({section: 5, remote: 25, full: false, connected: true, changed: [{index: 52, value: 24}]});

        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;
        setTimeout(() => {
          console.debug('Send AMV7 Not Normal');
          //Send AMV7 Not Normal
          sendChanges({section: 5, remote: 25, full: false, connected: true, changed: [{index: 52, value: 8}]});

        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;
        setTimeout(() => {
          console.debug('Send AMV7 Normal');
          //Send AMV7 Normal
          sendChanges({section: 5, remote: 25, full: false, connected: true, changed: [{index: 52, value: 24}]});

        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;
        setTimeout(() => {
          console.debug('Send AMV6 and AMV7 Not Normal');
          //Send AMV6 and AMV7 Not Normal
          sendChanges({section: 5, remote: 25, full: false, connected: true, changed: [{index: 52, value: 0}]});

        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;
        setTimeout(() => {
          console.debug('Send AMV6 and AMV7 Normal');
          //Send AMV6 and AMV7 Normal
          sendChanges({section: 5, remote: 25, full: false, connected: true, changed: [{index: 52, value: 24}]});

          currentState = STATE['LOCKED_ROUTE'];
        }, INDICATION_INTERVAL * seq_indications);
      }      
    }
  }
}

startTestCase(onDataReceived);