"use strict";

const { startTestCase, sendChanges } = require('../../src/test');

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

const INDICATION_INTERVAL = 5000;
let seq_indications = 0;
let currentState = STATE['WAITING_CONNECTION'];

const onDataReceived = (info) => {
  console.debug(JSON.stringify(info));

  if(info.connected) {
    if(currentState === STATE['WAITING_CONNECTION']) {
      sendChanges({section: 4, remote: 34, full: false, connected: true, changed: [{index: 1, value: 0}, {index: 4, value: 64}, {index: 5, value: 32}, {index: 12, value: 128}, {index: 13, value: 0}]});
      sendChanges({section: 4, remote: 33, full: false, connected: true, changed: [{index: 1, value: 16}, {index: 3, value: 4}, {index: 4, value: 66}, {index: 5, value: 32}, {index: 12, value: 0}, {index: 13, value: 0}, {index: 16, value: 0}]});
      sendChanges({section: 4, remote: 19, full: false, connected: true, changed: [{index: 1, value: 16}, {index: 3, value: 4}, {index: 4, value: 2}, {index: 5, value: 32}, {index: 13, value: 0}]});
      sendChanges({section: 4, remote: 18, full: false, connected: true, changed: [{index: 4, value: 64}, {index: 5, value: 32}, {index: 13, value: 0}]});
      sendChanges({section: 4, remote: 17, full: false, connected: true, changed: [{index: 1, value: 16}, {index: 3, value: 4}, {index: 4, value: 2}, {index: 12, value: 0}, {index: 13, value: 0}, {index: 16, value: 128}]});
      // sendChanges({section: 1, remote: 25, full: false, connected: true, changed: [{index: 3, value: 8}, {index: 4, value: 4}, {index: 10, value: 64}, {index: 11, value: 16}, {index: 12, value: 2}]});

      // //Send Route KM216.R_BE AVAILABLE - Virtual Route Mirror
      // sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 52, value: 0}]});

      // //Send Route KM216.R_BC AVAILABLE - Real Route
      // sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 1, value: 0}]});

      // //Send Route KM216.R_BC AVAILABLE - Real Route
      // sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 3, value: 0}]});

      // //Send Route KM216.WT Occup1 - false
      // // sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 12, value: 128}]});
      // sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 12, value: 0}]});

      // //Send Route KM216.WT Occup2 - false
      // // sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 13, value: 8}]});
      // sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 13, value: 0}]});

      // //Send Route KM209.WT R2_DA - true
      // // sendChanges({section: 2, remote: 25, full: false, connected: true, changed: [{index: 2, value: 64}]});
      // sendChanges({section: 1, remote: 25, full: false, connected: true, changed: [{index: 2, value: 0}]});

      seq_indications = 1;
      setTimeout(() => {
        sendChanges({section: 4, remote: 17, full: false, connected: true, changed: [{index: 12, value: 128}]});
      }, INDICATION_INTERVAL * seq_indications);

      seq_indications++;
      setTimeout(() => {
        sendChanges({section: 4, remote: 34, full: false, connected: true, changed: [{index: 12, value: 0}]});
      }, INDICATION_INTERVAL * seq_indications);

      seq_indications++;
      setTimeout(() => {
        sendChanges({section: 4, remote: 33, full: false, connected: true, changed: [{index: 16, value: 128}]});
        sendChanges({section: 4, remote: 34, full: false, connected: true, changed: [{index: 1, value: 32}]});
      }, INDICATION_INTERVAL * seq_indications);

      seq_indications++;
      setTimeout(() => {
        sendChanges({section: 4, remote: 33, full: false, connected: true, changed: [{index: 12, value: 128}]});
      }, INDICATION_INTERVAL * seq_indications);

      seq_indications++;
      setTimeout(() => {
        sendChanges({section: 4, remote: 33, full: false, connected: true, changed: [{index: 13, value: 128}]});
      }, INDICATION_INTERVAL * seq_indications);

      seq_indications++;
      setTimeout(() => {
        sendChanges({section: 4, remote: 17, full: false, connected: true, changed: [{index: 16, value: 0}]});
        sendChanges({section: 4, remote: 34, full: false, connected: true, changed: [{index: 1, value: 16}]});
      }, INDICATION_INTERVAL * seq_indications);

      seq_indications++;
      setTimeout(() => {
        sendChanges({section: 4, remote: 17, full: false, connected: true, changed: [{index: 12, value: 0}]});
      }, INDICATION_INTERVAL * seq_indications);

      seq_indications++;
      setTimeout(() => {
        sendChanges({section: 4, remote: 17, full: false, connected: true, changed: [{index: 13, value: 0}]});
      }, INDICATION_INTERVAL * seq_indications);

      seq_indications++;
      setTimeout(() => {
        sendChanges({section: 4, remote: 33, full: false, connected: true, changed: [{index: 16, value: 0}]});
      }, INDICATION_INTERVAL * seq_indications);

      seq_indications++;
      setTimeout(() => {
        sendChanges({section: 4, remote: 34, full: false, connected: true, changed: [{index: 1, value: 16}]});
      }, INDICATION_INTERVAL * seq_indications);

      seq_indications++;
      setTimeout(() => {
        sendChanges({section: 4, remote: 33, full: false, connected: true, changed: [{index: 12, value: 0}]});
      }, INDICATION_INTERVAL * seq_indications);

      seq_indications++;
      setTimeout(() => {
        sendChanges({section: 4, remote: 33, full: false, connected: true, changed: [{index: 1, value: 16}, {index: 13, value: 0}]});
      }, INDICATION_INTERVAL * seq_indications);

      currentState = STATE['WAITING_COMMAND']; 
    }
    else if(info.section === 2 && info.remote === 17 && info.port === 2 && info.value === 1) {
      // Cancel Route KM216.R_BC

      console.debug('Cancell route KM216.R_BC received !!!');

      //Send Route KM216.R_BE AVAILABLE - Virtual Route Mirror
      sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 52, value: 0}]});

      //Send Route KM216.R_BC AVAILABLE - Real Route
      sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 1, value: 0}]});

      //Send Route KM216.R_BC AVAILABLE - Real Route
      sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 3, value: 0}]});
    }
    else if(info.section === 2 && info.remote === 17 && info.port === 1 && info.value === 8) {
        // Requested Route KM216.R_BC
        console.debug('Requested Route KM216.R_BC !!');

        if(currentState === STATE['LOCKED_ROUTE']) {
          console.debug(' -------- test case: LOCKED_ROUTE started !!!');
  
          seq_indications = 1;

          //Send Route KM216.R_BC GRANTED - Real Route
          setTimeout(() => {
            console.debug('Send Route KM216.R_BC GRANTED - Real Route');
            //Send Route KM216.R_BC GRANTED - Real Route
            sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 1, value: 64}, {index: 52, value: 32}]});

            // console.debug('Send Route KM216.R_BC REGISTERED - Real Route');
            // //Send Route KM216.R_BC REGISTERED - Real Route
            // sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 1, value: 128}, {index: 52, value: 32}]});
          }, INDICATION_INTERVAL * seq_indications);
    
          seq_indications++;
          setTimeout(() => { 
            console.debug('Send Indication KM216.WT Occup1 = true');
            //Send Indication KM216.WT Occup1 = true
            sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 12, value: 128}]});
          }, INDICATION_INTERVAL * seq_indications);
  
          seq_indications++;
          setTimeout(() => {
            console.debug('Send Route KM216.R_BC UNGRANTED - Virtual Route');
            //Send Route KM216.R_BC UNGRANTED - Virtual Route
            sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 1, value: 0}]});
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
  
            //Send Route KM216.R_BE AVAILABLE - Virtual Route Mirror
            sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 52, value: 0}]});

            //Send Route KM216.R_BC AVAILABLE - Real Route
            sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 1, value: 0}]});

            //Send Route KM216.R_BC AVAILABLE - Real Route
            sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 3, value: 0}]});
  
            currentState = STATE['REAL_ROUTE_GRANTED'];
          }, INDICATION_INTERVAL * seq_indications);
        }
        if(currentState === STATE['REAL_ROUTE_GRANTED']) {
        console.debug(' -------- test case: REAL_ROUTE_GRANTED started !!!');

        console.debug('Send Route KM216.R_BC GRANTED - Real Route');
        //Send Route KM216.R_BC GRANTED - Real Route
        sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 1, value: 64}]});

        seq_indications = 1;

        setTimeout(() => {
          console.debug('Send Route KM216.R_BE GRANTED - Virtual Route');
          //Send Route KM216.R_DE GRANTED - Virtual Route
          sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 52, value: 32}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route KM216.R_BE REGISTRED - Virtual Route');
          //Send Route KM216.R_BE REGISTRED - Virtual Route
          sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 52, value: 64}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route KM216.R_BE AVAILABLE - Virtual Route');
          //Send Route KM216.R_BE AVAILABLE - Virtual Route
          sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 52, value: 0}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route KM216.R_BE GRANTED - Virtual Route');
          //Send Route KM216.R_BE GRANTED - Virtual Route
          sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 52, value: 32}]});

          currentState = STATE['REAL_ROUTE_REGISTERED'];
        }, INDICATION_INTERVAL * seq_indications);
      }
      if(currentState === STATE['REAL_ROUTE_REGISTERED']) {
        console.debug(' -------- test case: REAL_ROUTE_REGISTERED started !!!');

        console.debug('Send Route KM216.R_BC REGISTERED - Real Route');
        //Send Route KM216.R_BC REGISTERED - Real Route
        sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 1, value: 128}]});

        seq_indications = 1;

        setTimeout(() => {
          console.debug('Send Route KM216.R_BE GRANTED - Virtual Route');
          //Send Route KM216.R_BE GRANTED - Virtual Route
          sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 52, value: 32}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route KM216.R_BE REGISTRED - Virtual Route');
          //Send Route KM216.R_BE REGISTRED - Virtual Route
          sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 52, value: 64}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route KM216.R_BE AVAILABLE - Virtual Route');
          //Send Route KM216.R_BE AVAILABLE - Virtual Route
          sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 52, value: 0}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route KM216.R_BE GRANTED - Virtual Route');
          //Send Route KM216.R_BE GRANTED - Virtual Route
          sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 52, value: 32}]});

          currentState = STATE['REAL_ROUTE_TIMELOCKED'];
        }, INDICATION_INTERVAL * seq_indications);
      }      
      if(currentState === STATE['REAL_ROUTE_TIMELOCKED']) {
        console.debug(' -------- test case: REAL_ROUTE_TIMELOCKED started !!!');

        console.debug('Send Route KM216.R_BC GRANTED - Real Route');
        //Send Route KM216.R_BC GRANTED - Real Route
        sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 1, value: 64}]});

        console.debug('Send Route KM216.R_BC TIMELOCKED - Real Route');
        //Send Route KM216.R_DC TIMELOCKED - Real Route
        sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 3, value: 1}]});

        seq_indications = 1;

        setTimeout(() => {
          console.debug('Send Route KM216.R_BE GRANTED - Virtual Route');
          //Send Route KM216.R_BE GRANTED - Virtual Route
          sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 52, value: 32}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route KM216.R_BE REGISTRED - Virtual Route');
          //Send Route KM216.R_BE REGISTRED - Virtual Route
          sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 52, value: 64}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route KM216.R_BE AVAILABLE - Virtual Route');
          //Send Route KM216.R_BE AVAILABLE - Virtual Route
          sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 52, value: 0}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route KM216.R_BC UNTIMELOCKED - Real Route');
          //Send Route KM216.R_BC UNTIMELOCKED - Real Route
          sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 3, value: 0}]});

          console.debug('Send Route KM216.R_BE GRANTED - Virtual Route');
          //Send Route KM216.R_BE GRANTED - Virtual Route
          sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 52, value: 32}]});

          currentState = STATE['VIRTUAL_ROUTE_GRANTED'];
        }, INDICATION_INTERVAL * seq_indications);
      }
      if(currentState === STATE['VIRTUAL_ROUTE_GRANTED']) {
        console.debug(' -------- test case: VIRTUAL_ROUTE_GRANTED started !!!');

        console.debug('Send Route KM216.R_BE GRANTED - Virtual Route');
        //Send Route KM216.R_BE GRANTED - Virtual Route
        sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 52, value: 32}]});

        seq_indications = 1;

        setTimeout(() => {
            console.debug('Send Route KM216.R_BC GRANTED - Real Route');
            //Send Route KM216.R_BC GRANTED - Real Route
            sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 1, value: 64}]});
          }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route KM216.R_BC TIMELOCKED - Real Route');
          //Send Route KM216.R_BC TIMELOCKED - Real Route
          sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 3, value: 1}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route KM216.R_BC UNTIMELOCKED - Real Route');
          //Send Route KM216.R_BC UNTIMELOCKED - Real Route
          sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 3, value: 0}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route KM216.R_BC REGISTERED - Real Route');
          //Send Route KM216.R_BC REGISTERED - Real Route
          sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 1, value: 128}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route KM216.R_BC AVAILABLE - Real Route');
          //Send Route KM216.R_BC AVAILABLE - Real Route
          sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 1, value: 0}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route KM216.R_BC GRANTED - Real Route');
          //Send Route KM216.R_BC GRANTED - Real Route
          sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 1, value: 64}]});

          currentState = STATE['VIRTUAL_ROUTE_REGISTERED'];
        }, INDICATION_INTERVAL * seq_indications);
      }      
      if(currentState === STATE['VIRTUAL_ROUTE_REGISTERED']) {
        console.debug(' -------- test case: VIRTUAL_ROUTE_REGISTERED started !!!');

        console.debug('Send Route KM216.R_BE REGISTRED - Virtual Route');
        //Send Route KM216.R_BE REGISTRED - Virtual Route
        sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 52, value: 64}]});

        seq_indications = 1;

        setTimeout(() => {
          console.debug('Send Route KM216.R_BC GRANTED - Real Route');
          //Send Route KM216.R_BC GRANTED - Real Route
          sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 1, value: 64}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route KM216.R_BC REGISTERED - Real Route');
          //Send Route KM216.R_BC REGISTERED - Real Route
          sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 1, value: 128}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route KM216.R_BC TIMELOCKED - Real Route');
          //Send Route KM216.R_BC TIMELOCKED - Real Route
          sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 3, value: 1}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route KM216.R_BC UNTIMELOCKED - Real Route');
          //Send Route KM216.R_BC UNTIMELOCKED - Real Route
          sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 3, value: 0}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route KM216.R_BC AVAILABLE - Real Route');
          //Send Route KM216.R_BC AVAILABLE - Real Route
          sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 1, value: 0}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route KM216.R_BC GRANTED - Real Route');
          //Send Route KM216.R_BC GRANTED - Real Route
          sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 1, value: 64}]});

          currentState = STATE['VIRTUAL_ROUTE_AVAILABLE'];
        }, INDICATION_INTERVAL * seq_indications);
      }
      if(currentState === STATE['VIRTUAL_ROUTE_AVAILABLE']) {
        console.debug(' -------- test case: VIRTUAL_ROUTE_AVAILABLE started !!!');

        seq_indications = 1;

        setTimeout(() => {
          console.debug('Send Route KM216.R_BC GRANTED - Real Route');
          //Send Route KM216.R_BC GRANTED - Real Route
          sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 1, value: 64}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route KM216.R_BC REGISTERED - Real Route');
          //Send Route KM216.R_BC REGISTERED - Real Route
          sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 1, value: 128}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route KM216.R_BC TIMELOCKED - Real Route');
          //Send Route KM216.R_BC TIMELOCKED - Real Route
          sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 3, value: 1}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route KM216.R_BC UNTIMELOCKED - Real Route');
          //Send Route KM216.R_BC UNTIMELOCKED - Real Route
          sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 3, value: 0}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route KM216.R_BC AVAILABLE - Real Route');
          //Send Route KM216.R_BC AVAILABLE - Real Route
          sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 1, value: 0}]});
        }, INDICATION_INTERVAL * seq_indications);

        seq_indications++;

        setTimeout(() => {
          console.debug('Send Route KM216.R_BC GRANTED - Real Route');
          //Send Route KM216.R_BC GRANTED - Real Route
          sendChanges({section: 2, remote: 17, full: false, connected: true, changed: [{index: 1, value: 64}]});

          currentState = STATE['REAL_ROUTE_GRANTED'];
        }, INDICATION_INTERVAL * seq_indications);
      }      
    }
  }
}

startTestCase(onDataReceived);