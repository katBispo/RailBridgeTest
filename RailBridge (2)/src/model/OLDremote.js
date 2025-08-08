const ProtocolFactory = require('../communication/protocolFactory');
const Protocol = require('../communication/protocol/protocol');

class Remote {
  constructor(address, port, protocol, remoteId, words, pollInterval, recallFrequency, disconnectPeriod, timeoutLimit, listenmode, cb) {
    this.address = address;
    this.port = +port;
    this.remoteId = +remoteId;
    this.online = false;
    this.pollInterval = +pollInterval;
    this.recallFrequency = +recallFrequency;
    this.disconnectPeriod = +disconnectPeriod;
    this.timeoutLimit = +timeoutLimit;
    this.words = +words;
    this.cb = cb;
    this.commandQueue = [];
    this.onDataReceived = this.onDataReceived.bind(this);
    this.sendCommand = this.sendCommand.bind(this);
    this.count = 0;
    this.attempts = 0;
    this.active = false;
    this.listenmode = listenmode;
    this.forceRecall = true; // Force recall for full sweep request
    this.fullsweep = false;
    this.status = {remote: this.remoteId, full: true, connected: false, data: new Array(this.words)};

    for(let i = 0; i < this.status.data.length; i++) {
      this.status.data[i] = -1;
    }

    this.protocol = ProtocolFactory.create(protocol, address, port, remoteId, this.onDataReceived); //port: 7169

    if(this.address) {
      setInterval(() => {
        console.log(`@@@ Verificando remoto ${this.remoteId}: ativo=${this.active}, commandQueue=${JSON.stringify(this.commandQueue)}`);
        if(this.active) {
          // Check for timeout request
          if(this.protocol.getTimeSpent() > this.timeoutLimit) {
            this.protocol.resetState();
            this.attempts++;
  
            console.debug(`remote ${this.remoteId} timeout attempts: ${this.attempts}`);
  
            if(this.status.connected && this.attempts > this.disconnectPeriod) {
              this.status.connected = false;
              console.debug(`remote ${this.remoteId} disconnected !!!`);
              // Remote Disconnected
              if(this.cb) {
                this.cb({remote: this.remoteId, full: false, connected: false, changed: []});
              }
            }
          }
  
          // Check for pending command to send in commandQueue
          if(this.commandQueue.length > 0) {
            const commandData = this.commandQueue.shift();
            this.protocol.sendCommand(commandData);
          }
  
          if((this.count % this.recallFrequency) === 0 || this.forceRecall) {
            this.protocol.sendRecall();
            this.forceRecall = false;
          }
          else {
            this.protocol.sendPoll();
          }
          this.count++;
        }
      }, this.pollInterval);
    }
  }

  clearRemote() {
    this.status.data = new Array(this.words);
  }

  sendCommand(data) {
    console.log(`@@@ Enviando comando para remoto ${this.remoteId}, ativo: ${this.active}, listenmode: ${this.listenmode}`);
    if(this.active && !this.listenmode) {
      this.commandQueue.push(data);
    }else{
      console.log(`@@@ Comando não enviado para remoto ${this.remoteId}: ativo=${this.active}, listenmode=${this.listenmode}`);
    }
  }

  onDataReceived(indication) {
    let idx = 0;
    let hasChanged = false;
    this.status.connected = true;
    this.attempts = 0;
    console.debug(`remote ${this.remoteId} connected: ${this.status.connected}`);    

    const res = {remote: this.remoteId, full: false, connected: true, changed: []};

    if(indication.length > 1) {
      while((idx+1) < indication.length) {
        changesAccepted = (indication[idx] > currentIndex);

        if((indication[idx] <= this.words) && (this.status.data[indication[idx]] !== indication[idx+1])) {
          this.status.data[indication[idx]] = indication[idx+1];
          res.changed.push({index: indication[idx], value: indication[idx+1]});

          hasChanged = true;
        }

        idx += 2;
      }
    }

    if(hasChanged) {
      console.log(`@@@ Enviando resposta para indicationExchange: ${JSON.stringify(res)}`);
      if(this.cb) {
        this.cb(res);
      }
    }
  }
}

module.exports = Remote;