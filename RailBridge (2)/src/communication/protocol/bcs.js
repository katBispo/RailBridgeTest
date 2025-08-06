const UDPSocket = require('../channel/UDPSocket');
const Serial = require('../channel/Serial');
const Protocol = require('./protocol');

const STD_BCH_XOR = 0x28;
const STD_BCH_MASK = 0x80;

const code = {
  NONE: 0x00,
  RECALL: 0x01,
  POLL: 0x02,
  REQUEST_DATA: 0xFF,
}

class BCS extends Protocol {
  constructor(address, port, remoteId, listenmode, cb) {
    super(new Date());

    this.address = address;
    this.port = +port;
    this.remoteId = +remoteId;
    this.listenmode = listenmode;
    this.cb = cb;
    this.onData = this.onData.bind(this);
    if(this.address) {
      this.comm = new UDPSocket(this.port, this.onData);
      this.channel = this.comm.getChannel();
    }
  }

  calcBCH(msg) {
    let bch = 0xf8;
    let i, j, bitA, bitB;
  
    for (i=0; i<3; i++)
    {
      let byte = msg[i];
      for (j=0; j<8; j++)
      {
        bitB = (STD_BCH_MASK & byte) ? 1 : 0;
        bitA = (STD_BCH_MASK & bch) ? 1 : 0;
        bch <<= 1;
        byte <<= 1;
        if (bitB != bitA) {
          bch = bch ^ STD_BCH_XOR;
        }
      }
    }
  
    return bch;
  }
    
  buildMessage(port, value) {
    let msg = [this.remoteId, port, value];
    const bch = this.calcBCH(msg);
    
    msg = [...msg, bch];

    if(port < 0xFF) {
      for (let i=0; i<4; i++) {
        msg[i+4] = ~msg[i];
      }
    }
  
    const message = Buffer.from(msg, 'hex');

    return message;
  }
  
  send(message) {
    if(!this.listenmode) {
      console.log(`> ${Protocol.toHexString(message)} to ${this.address}:${this.port}`);
      this.channel.send(message, this.port, this.address, (err) => {
        if(err) {
          console.error(`Send error:\n${err.stack}`);
          this.available = true;
        }
      });    
    }
  }
  
  sendPoll() {
    console.debug(`sendPoll for Remote ${this.remoteId} - available: ${this.available}`);
    if(this.available) {
      this.available = false;
      this.time = new Date();
      const message = this.buildMessage(code['REQUEST_DATA'], code['POLL']);
      this.send(message);
    }
  }

  sendRecall() {
    console.debug(`sendRecall for Remote ${this.remoteId} - available: ${this.available}`);
    if(this.available) {
      this.available = false;
      this.time = new Date();
      const message = this.buildMessage(code['REQUEST_DATA'], code['RECALL']);
      this.send(message);
    }
  }

  sendCommand(data) {
    console.debug(`sendCommand for Remote ${this.remoteId} - available: ${this.available}`);
    if(this.available) {
      this.available = false;
      this.time = new Date();
      const message = this.buildMessage(data.port, data.value);
      this.send(message);
    }
  }
  
  handleResponseData(message) {
    if(message && message.length >= 3) {
      const responseRemoteId = +message[0];
      const responseCode = +message[1];
      const responseValue = +message[2];

      if(this.remoteId === responseRemoteId) {
        console.log(`< ${Protocol.toHexString(message)}`);

        if(responseCode !== code['REQUEST_DATA']) {
          const indication = [];
          message.forEach((item, index) => {
            if(((index-1) % 4) === 0) {
              indication.push(item);
            }
            if(((index-2) % 4) === 0) {
              indication.push(item);
            }
          });
          
          if(this.cb) {
            this.cb(indication);
          }
        }
        else if(responseValue === 0x01) {
          console.debug(`Command Applied for remote ${this.remoteId} !!!`);
        }
        else if(responseValue === 0x04) {
          console.debug(`Command Not Applied for remote ${this.remoteId} !!!`);
        }
        // else if(responseValue === 0x02) {
        //   console.debug(`No changes for Command of remote ${this.remoteId} !!!`);
        // }

        this.available = true;
      }
    }
  }

  onData(msg, rinfo) {
    this.handleResponseData(msg);
  }
}

module.exports = BCS;