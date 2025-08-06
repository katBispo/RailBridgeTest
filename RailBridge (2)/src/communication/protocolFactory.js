const Genisys = require('./protocol/genisys');
const Modbus = require('./protocol/modbus');
const BCS = require('./protocol/bcs');

const protocols = { 
  genisys: function(address, port, remoteId, listenmode, cb) { return new Genisys(address, port, remoteId, listenmode, cb) }, 
  modbus: function(address, port, remoteId, listenmode, cb) { return new Modbus(address, port, remoteId, listenmode, cb) }, 
  bcs: function(address, port, remoteId, listenmode, cb) { return new BCS(address, port, remoteId, listenmode, cb) }
};

class ProtocolFactory {
  constructor() {
  }

  static create(protocol, address, port, remoteId, listenmode, cb) {
    if(protocols[protocol]) {
      return protocols[protocol](address, port, remoteId, listenmode, cb);
    }
    else {
      return null;
    }
  }
}

module.exports = ProtocolFactory;