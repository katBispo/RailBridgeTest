const { SerialPort } = require('serialport');
const { startMockedTest, sendMockData } = require('../../mock/mockedTests');
const { InterByteTimeoutParser } = require('@serialport/parser-inter-byte-timeout');

/** 
 * commPort = new SerialPort(portName, { 
 *  baudRate: 9600,
 *  autoOpen: true,
 *  databits: 8,
 *  lock: true, // false is not support on windows
 *  parity: 'none',
 *  stopBits: 1, 
 *  bufferSize: 65536,
 *  rtscts: false,
 *  xon: false,
 *  xoff: false,
 *  xany:false,
 *  parser: new SerialPort.parsers.ByteLength({length: 4})
 *  // parser: SerialPort.parsers.raw
 * });
 */

const callbacks = [];

let instances = 0;
let commPort = null;
let parser = null;

class Serial {
  constructor(port, baudRate, timeout, waitToSend, waitHalfCommand, stopBits, parity, cb) {
    if(cb) {
      callbacks.push(cb);

      if(process.env.NODE_ENV && (process.env.NODE_ENV === 'development')) {
        console.log('Using mocked data...');
        startMockedTest(cb);
      }
    }

    if(instances === 0) {
      console.debug(`instances: ${instances}`);

      this.port = port;
      this.baudRate = baudRate;
      this.timeout = timeout;
      this.waitToSend = waitToSend;
      this.waitHalfCommand = waitHalfCommand;
      this.stopBits = stopBits;
      this.parity = parity;            

      if(!this.port) {
        console.error(`port is undefined !!!`);
        return;
      }

      console.log(`Opening serial port on ${this.port}`);

      commPort = new SerialPort({ 
        path: this.port,
        baudRate: this.baudRate,
        autoOpen: false,
        stopBits: this.stopBits,
        parity: this.parity                
        //parser: SerialPort.parsers.raw
      });            
      
      console.debug(`commPort created !!!`);

      commPort.on('open', async () => {
        console.info(`${this.port} is opened !!! Data rate: ${commPort.baudRate}`);
        
        commPort.flush((err) => {
          if(err) {
            console.error(`Error on flusing data: ${err}`);            
          }
          console.info(`Flushed data!`);
        })

        parser = commPort.pipe(new InterByteTimeoutParser({ interval: 30, maxBufferSize: 400 }));              
              
        parser.on('data', (data) => {          
          for(const cbf of callbacks) {
            cbf(data, null);
          }
        });
      });

      commPort.on('close', () => {
        console.info(`${this.port} was closed !!!`)
      });
      
      commPort.on('error', (err) => {
        console.error(err);
      });
      
      commPort.on('disconnect', () => {
        console.debug(`${this.port} was disconnected !!!`)
      });

      instances++;
    }
  }

  sendData(data) {
    return new Promise((resolve, reject) => {
      let wasResolved = false;
      commPort.write(data, (err, bytesWritten) => {
        if(err) {
          reject(new Error(err));
        }
        else {
          console.debug(`writeHandler: ${JSON.stringify(bytesWritten)} was written to ${this.port}`);
          commPort.drain((err) => {
            if(err) {
              reject(new Error(err));
            }
            else {
              wasResolved = true;
              resolve(`data sent to port ${this.port}`);
            }
          });
        }
      });
  
      setTimeout(() => {
        if(!wasResolved) {
          console.debug('Timeout on sendData')
          reject(new Error('Timeout on sendData'));
        }
      }, this.timeout);
    });
  }

  // - Wait timeout to start to send
  // - Write to port
  // - Wait message delivered to port event 
  send(message) {
    return new Promise((resolve, reject) => {
      if(commPort.isOpen) {
        setTimeout(async() => {
          if(message.length > 4) {
            const msgPart1 = message.slice(0, 4);
            const msgPart2 = message.slice(4, 8);
        
            try {
              const response = await this.sendData(msgPart1);
              console.debug(`>> Response Part 1: ${response}`);
            }
            catch(err) {
              reject(new Error(err));
            }
        
            setTimeout(async() => {
              try {
                const response = await this.sendData(msgPart2);
                console.debug(`>> Response Part 2: ${response}`);

                if(process.env.NODE_ENV && (process.env.NODE_ENV === 'development')) {
                  sendMockData(message);
                }

                resolve(response);
              }
              catch(err) {
                reject(new Error(err));
              }
            }, this.waitHalfCommand);
          }
          else {
            try {
              const response = await this.sendData(message);
              console.debug(`Response Poll: ${response}`);

              if(process.env.NODE_ENV === 'development') {
                sendMockData(message)
              }

              resolve(response);
            }
            catch(err) {
              reject(new Error(err));
            }
          }
        }, this.waitToSend);
      }
      else {
        reject(new Error(`Port ${this.port} is not opened !!!`));
      }      
    });
  };

  // Deprecated
  enable() {
    return new Promise((resolve, reject) => {
      commPort.flush((err) => {
        if(err) {
          console.error(err);
          reject(new Error(err));
        }
        else {
          console.debug(`flushed data`);
    
          commPort.set({ rts: true }, (err) => { // This is already the default value
            if(err) {
              console.error(err);
              reject(new Error(err));
            }
            else {
              resolve();
            }
          });
        }
      });
    });
  }
  
  // Deprecated
  async disable() {
    return new Promise((resolve, reject) => {
      commPort.set({ rts: false }, (err) => {
        if(err) {
          console.error(err);
          reject(new Error(err));
        }
        else {
          resolve();
        }
      });
    });
  }  

  open() {
    return new Promise((resolve, reject) => { 
      if (commPort.isOpen) { 
        commPort.flush((err) => {
          if (err) {
            console.error(`Error on flushing already opened port: ${this.port}`);
            reject(new Error(`Error on flushing already opened port: ${this.port}`));
          }
          console.log(`Flushed data on already opened port: ${this.port}`);
          resolve(`Flushed data on already opened port: ${this.port}`);
        });      
      } else {
        commPort.open((err) => {
          if(err) {
            console.error(err);
            reject(new Error(err));
          }
          resolve(`Port ${this.port} opened!`);
        });
      }
    }); 
  }  

  close() {
    return new Promise((resolve, reject) => {      
      commPort.close((err) => {
        if(err) {
          console.error(err);
          reject(new Error(err));
        }
        else {
          console.debug(`Port ${this.port} closed`);
          resolve(`Port ${this.port} closed`);
        }
      });
    });
  }

  static list() {
    console.debug(`Serial ports:`);
    // list serial ports:
    SerialPort.list().then((ports) => {
      ports.forEach((port) => {
        console.debug(`port: ${port.path}, pnpId: ${port.pnpId}, manufacturer: ${port.manufacturer}, serialNumber: ${port.serialNumber}`);
      });
    });
  }
}

module.exports = Serial;