"use strict";

const Protocol = require('./communication/protocol/protocol');
const Serial = require('./communication/channel/Serial');
const BCS = require('./communication/protocol/bcs');
const { clearInterval, clearTimeout, setInterval, setTimeout } = require('node:timers');
const Metrics = require('./util/metrics');

const code = {
  COMMAND: 0x00,
  RECALL: 0x01,
  POLL: 0x02,
  REQUEST_DATA: 0xFF,
  LISTEN: 0x99
}

const FWT_LIMIT_FACTOR = 50;
const PWT_LIMIT_FACTOR = 10;
const BUFFER_SIZE = 3000;
const FIVE_MINUTES_MS = 5 * 60 * 1000;
const THREE_MINUTES_MS = 3 * 60 * 1000;

const defaultRecallWait = +global.gInterface.defaultRecallWait;
const defaultPollWait = +global.gInterface.defaultPollWait;
const remoteWaitTime = +global.gInterface.remoteWaitTime;
const waitHalfCommand = global.gInterface.waitHalfCommand;
const maxWaitTime = +global.gInterface.maxWaitTime;
let intervalPooling;

let requestTime;
let spentTime;

let responseData = [];
let cyclesReconnection = 3;

const responseRateMetrics = new Metrics(BUFFER_SIZE);
const responseRemoteMetrics = new Metrics(BUFFER_SIZE);

const dataHandler = (data) => {
  const currentTime = new Date();
  spentTime = currentTime - requestTime; 

  if(data && (typeof data[Symbol.iterator] === 'function')) {
    responseData = [...responseData, ...data];

    if(process.env.NODE_ENV && (process.env.NODE_ENV !== 'production')) {
      console.debug(`responseData: ${Protocol.toHexString(responseData)} - Len: ${responseData.length}; spentTime: ${spentTime}`);
    }
  }
  else if(process.env.NODE_ENV && (process.env.NODE_ENV !== 'production')) {
    console.debug(`Losing Data...`);
  }
}

const commandQueue = [];
const recallPending = [];
let cancelPoll = false;
const bcs = new BCS(null, 0, 0, null);
let serial = null;

const waitForResponseData = (timeoutMS) => {
  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      if (responseData.length > 0) {
        clearInterval(interval);
        clearTimeout(timeout);
        resolve(responseData);
      }
    }, 10); // verify if has data every 10ms

    const timeout = setTimeout(() => {
      clearInterval(interval);
      reject(new Error("Timeout: no data received"));
    }, timeoutMS);
  });
}

const receiveData = (remotes, remoteId, commandType, cb) => {
  let remote = remotes[remoteId];
  let index = 0;
  let refRemote = 0;
  let station;
  let port;
  let status;
  let bch;
  let bchReceived;
  let hasChanged = false;
  let noiseBytes = 0;
  let noiseInside = false;
  let understood = false;

  const response = {remote: remoteId, full: false, connected: true, changed: []};
  const remotesToRecall = [];    

  if(responseData.length >= 4) {
    while(index < (responseData.length - 3)) {
      station = +responseData[index];
      port = +responseData[index+1];
      status = +responseData[index+2];
      bchReceived = +responseData[index+3] & 0xFF;
      bch = +bcs.calcBCH([station, port, status]) & 0xFF;

      if(bchReceived === bch) {
        if(refRemote === 0) {
          refRemote = station;
          remote = remotes[refRemote];
          response.remote = refRemote;
          understood = true;
        }

        if (remote === undefined) {
          console.debug(`Received data for undefined remote for: ${station}`);
          noiseInside = true;
          noiseBytes++;
          index++;
          continue;
        }

        if(station === refRemote) {
          if(!remote.status.connected) {
            remote.status.connected = true;
            remote.attempts = 0;
            console.debug(`remote 0x${remote.remoteId.toString(16)} (${remote.remoteId}) connected: ${remote.status.connected}`);
          }
  
          if((port !== 0xFF) && (port <= remote.words) && (remote.status.data[port] !== status || remote.fullsweep )) {            
            remote.status.data[port] = status;
            response.changed.push({index: port, value: status});
  
            hasChanged = true;
          }
      
          index+=4;
        }
        else if(port !== 0xFF) {
          // - Send a priority recall to verify all remote's data
          if(!remotesToRecall[station]) {
            commandQueue.push({remote: station, port: 0xFF, value: 0x01});
            console.debug(`commandQueue.push({remote: ${station}, port: 0xFF, value: 0x01})`);
            remotesToRecall[station] = true;
          }

          noiseInside = true;
          index++;
        }
        else {
          noiseInside = true;
          index+=4;
        }

        remote.attempts = 0;
      }
      else {
        index++;
        noiseBytes++;
        console.debug(`noiseBytes: [${Protocol.toHexString([station, port, status, bchReceived])}] - BCH expected: ${bch.toString(16)}`);
      }
    }

    if (remote?.fullsweep) {
      remote.fullsweep = false;
      response.fullsweep = true;
    }

    console.debug(`noise bytes: ${noiseBytes}`);
    console.debug(`response.changed for remote 0x${remote.remoteId.toString(16)} (${remote.remoteId}): ${JSON.stringify(response.changed)}`);

    if(commandType === code['RECALL']) {
      remote.spentRecall = spentTime;
      console.debug(`remote 0x${remote.remoteId.toString(16)} (${remote.remoteId}) spentRecall: ${remote.spentRecall}`);
    }
    else if (commandType === code['POLL']) {
      remote.spentPoll = spentTime;
      console.debug(`remote 0x${remote.remoteId.toString(16)} (${remote.remoteId}) spentPoll: ${remote.spentPoll}`);
    }
    spentTime = 0;

    recallPending[remote.remoteId] = noiseInside;    

    responseRateMetrics.add(((responseData.length - noiseBytes) / responseData.length) * 100);
  }

  if(hasChanged) {
    if(cb) {      
      cb(response);
    }
  }

  if(remote && !understood) {
    // - No data response
    remote.attempts++;
    console.debug(`No data response for remote 0x${remote.remoteId.toString(16)} (${remote.remoteId}) - attempts: ${remote.attempts}`);
    // - Send recall to verify all remote's data on the next cycle
    recallPending[remote.remoteId] = true;
  }
  responseData = [];  
}

// - Polling to serial remotes
const pollingProcess = async(remotes, listenmode, cb, reportCB) => {
  let idx = 0;
  let recallTurn = 0;
  let commandType = 0x00;
  let remote;
  let waiting = false;

  let remotesResponseOK = 0;
  let totalRemotes = remotes.filter(remote => remote != null && remote != undefined).length  

  cancelPoll = false;

  if (intervalPooling) {
    console.log('@@@ pollingProcess already running!');
    return;
  }

  if(!serial) {
    serial = new Serial(global.gInterface.COMMPort, 
      global.gInterface.baudRate, 
      global.gInterface.sendTimeout,
      global.gInterface.waitToSend,
      global.gInterface.waitHalfCommand,
      global.gInterface.stopBits,
      global.gInterface.parity,
      dataHandler);

    if(global.gInterface.cyclesReconnection) {
      cyclesReconnection = global.gInterface.cyclesReconnection;
    }
  }

  await serial.open();
  
  responseData = [];

  // waiting variable is used to avoid send another poll, recall or command Before
  // the current end 
  intervalPooling = setInterval(async() => {
    let requestType;

    if (waiting) return;

    if(!listenmode) {
      if(cancelPoll) return;      
      
      if(remotes[idx]) {
        console.debug(`remote: ${remotes[idx].remoteId}`);

        if(commandQueue.length > 0) {
          const commandData = commandQueue.shift();
          remote = remotes[commandData.remote];
  
          console.debug(`Command from commandQueue: ${JSON.stringify(commandData)}`);
          
          if(remote?.active) {
            bcs.remoteId = remote.remoteId;
            requestType = 'COMMAND';
  
            const message = bcs.buildMessage(commandData.port, commandData.value);
            console.log(`> ${Protocol.toHexString(message)}`);
            await serial.send(message);
            requestTime = new Date();
            commandType = code[requestType];
  
            if(!remote.spentPoll) {
              remote.spentPoll = defaultPollWait;
            }
              
            waiting = true;
          }
        }
        else {
          remote = remotes[idx];
          requestType = 'RECALL';
  
          if(remote && !remote.cycleRemains) {
            remote.cycleRemains = 0;
          }
  
          if(remote?.active && remote?.cycleRemains == 0) {
            bcs.remoteId = remote.remoteId;
  
            console.debug(`Remote id: ${remotes[idx].remoteId}; recallTurn: ${recallTurn}; remote: ${remote.remoteId}; recallPending: ${recallPending[remote.remoteId]}; spentPollTime: ${remote.spentPoll}ms; spentRecallTime: ${remote.spentRecall}ms; forceRecall: ${remote.forceRecall}`);
  
            if((recallTurn === remote.remoteId) || !remote.spentRecall || recallPending[remote.remoteId] || remote.forceRecall) {
              const message = bcs.buildMessage(code['REQUEST_DATA'], code[requestType]);
              console.log(`> ${Protocol.toHexString(message)}`);
              await serial.send(message);

              remote.fullsweep = true;
              remote.forceRecall = false;
              requestTime = new Date();
              commandType = code[requestType];
  
              if(!remote.spentRecall) {
                remote.spentRecall = defaultRecallWait;
              }
  
              if(recallPending[remote.remoteId]) {
                recallPending[remote.remoteId] = false;
              }
            }
            else {
              requestType = 'POLL';
              const message = bcs.buildMessage(code['REQUEST_DATA'], code[requestType]);
              console.log(`> ${Protocol.toHexString(message)}`);
              await serial.send(message);
              requestTime = new Date();
              commandType = code[requestType];
  
              if(!remote.spentPoll) {
                remote.spentPoll = defaultPollWait;
              }                  
  
              if(recallPending[remote.remoteId]) {
                recallPending[remote.remoteId] = false;
              }
            }
    
            waiting = true;            
          }
    
          if(remote && remote.cycleRemains > 0) {
            console.debug(`cycleRemains for remote 0x${remote.remoteId.toString(16)} (${remote.remoteId}): ${remote.cycleRemains}`);
            remote.cycleRemains--;
          }

          // only increment when POLL or RECALL
          idx++
        }

        // - Verify response and update the wait time to the request
        if(waiting) {
          try {
            let waitTime = requestType === 'COMMAND' ? remoteWaitTime : 0;
            const response = await waitForResponseData(maxWaitTime + waitTime);
            console.log(`< ${Protocol.toHexString(response)}`);
            receiveData(remotes, remote.remoteId, commandType, cb);
            if (requestType !== 'COMMAND') remotesResponseOK++;
          } 
          catch(err) {
            console.log(`< empty response for remote: 0x${remote.remoteId.toString(16)} (${remote.remoteId}) - error: ${err}`);
            remote.attempts++;            
            responseData = [];            
          }
          
          waiting = false;              
        }

        // verify remote connectivity
        // if(remote.status.connected && remote.attempts > remote.disconnectPeriod) {
        if(remote && remote.attempts > remote.disconnectPeriod) {
          remote.status.connected = false;
          console.debug(`remote 0x${remote.remoteId.toString(16)} (${remote.remoteId}) disconnected !!!`);
          remote.cycleRemains = cyclesReconnection;
          remote.attempts = 0;

          // Remote Disconnected
          if(cb) {
            cb({remote: remote.remoteId, full: false, connected: false, changed: []});
          }
          else {
            console.debug(`callback function undefined for remote disconnected !!!`);
          }
        }
      }
      else {
        console.debug(`Remote ${idx} not found !!!`);
        idx++;
      }
      
      if(idx >= remotes.length) {
        idx = 0;
        recallTurn++;

        if(recallTurn >= remotes.length) recallTurn = 0;

        let metric = (remotesResponseOK / totalRemotes) * 100;
        console.debug(`Adding metrics remotes availability: ${remotesResponseOK} OK from ${totalRemotes} remotes = ${metric}%`);
        responseRemoteMetrics.add(metric);

        remotesResponseOK = 0;
      }
    }
    else {
    // listen mode
      try {
        waiting = true        
        const response = await waitForResponseData(maxWaitTime);
        console.log(`< ${Protocol.toHexString(response)}`);
        receiveData(remotes, 9999, code['LISTEN'], cb);         
      } 
      catch(err) {
        console.log(`< empty response in listenmode: ${err}`);
      }
      responseData = [];
      waiting = false
    }
  }, global.gInterface.waitAskTime);
} 

const sendCommand = (command) => {
  commandQueue.push(command);
}

const pollCancelled = async() => { 
  if (intervalPooling) { 
    cancelPoll = true;  
    clearInterval(intervalPooling);
    intervalPooling = null;
    responseData = [];
    if(serial?.isOpen) await serial.close();
    console.log('Polling cancelled!!!');
  }
}

const getMetrics = () => {
  return {
    responseRate: responseRateMetrics.getMovingAverage(THREE_MINUTES_MS),
    remotesOK: responseRemoteMetrics.getMovingAverage(THREE_MINUTES_MS)
  }
}

module.exports = {pollingProcess, sendCommand, pollCancelled, getMetrics};
