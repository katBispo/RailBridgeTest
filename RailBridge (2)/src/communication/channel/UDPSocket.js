const dgram = require('dgram');

const callbacks = [];

let instances = 0;
let socket = undefined;
let port = 0;

class UDPSocket {
  constructor(portNumber, cb) {
    if(cb) {
      callbacks.push(cb);
    }

    if(instances === 0) {
      console.debug(`instances: ${instances}`);

      if(portNumber) {
        port = portNumber;
      }
      socket = dgram.createSocket('udp4');

      console.debug(`sending to port ${port}`);

      socket.on('error', (err) => {
        console.error(`Server error:\n${err.stack}`);
        socket.close();
      });
      
      socket.on('message', (msg, rinfo) => {
        for(const cbf of callbacks) {
          cbf(msg, rinfo);
        }
      });
      
      socket.on('listening', () => {
        const address = socket.address();
        console.debug(`server listening ${address.address}:${address.port}`);
      });
      
      if(process.env.NODE_ENV && (process.env.NODE_ENV !== 'development')) {
        socket.bind(port);
      }
      else if(global.gInterface) {
          socket.bind(global.gInterface.port);
      }
      else {
        socket.bind(port-1);
      }

      instances++;
    }
  }

  getChannel() {
    return socket; 
  }

}

module.exports = UDPSocket;