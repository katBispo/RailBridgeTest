const UDPSocket = require('../channel/UDPSocket');
const Protocol = require('./protocol');

crc16Table = [
  0x0000, 0xC0C1, 0xC181, 0x0140, 0xC301, 0x03C0, 0x0280, 0xC241,
  0xC601, 0x06C0, 0x0780, 0xC741, 0x0500, 0xC5C1, 0xC481, 0x0440,
  0xCC01, 0x0CC0, 0x0D80, 0xCD41, 0x0F00, 0xCFC1, 0xCE81, 0x0E40,
  0x0A00, 0xCAC1, 0xCB81, 0x0B40, 0xC901, 0x09C0, 0x0880, 0xC841,
  0xD801, 0x18C0, 0x1980, 0xD941, 0x1B00, 0xDBC1, 0xDA81, 0x1A40,
  0x1E00, 0xDEC1, 0xDF81, 0x1F40, 0xDD01, 0x1DC0, 0x1C80, 0xDC41,
  0x1400, 0xD4C1, 0xD581, 0x1540, 0xD701, 0x17C0, 0x1680, 0xD641,
  0xD201, 0x12C0, 0x1380, 0xD341, 0x1100, 0xD1C1, 0xD081, 0x1040,
  0xF001, 0x30C0, 0x3180, 0xF141, 0x3300, 0xF3C1, 0xF281, 0x3240,
  0x3600, 0xF6C1, 0xF781, 0x3740, 0xF501, 0x35C0, 0x3480, 0xF441,
  0x3C00, 0xFCC1, 0xFD81, 0x3D40, 0xFF01, 0x3FC0, 0x3E80, 0xFE41,
  0xFA01, 0x3AC0, 0x3B80, 0xFB41, 0x3900, 0xF9C1, 0xF881, 0x3840,
  0x2800, 0xE8C1, 0xE981, 0x2940, 0xEB01, 0x2BC0, 0x2A80, 0xEA41,
  0xEE01, 0x2EC0, 0x2F80, 0xEF41, 0x2D00, 0xEDC1, 0xEC81, 0x2C40,
  0xE401, 0x24C0, 0x2580, 0xE541, 0x2700, 0xE7C1, 0xE681, 0x2640,
  0x2200, 0xE2C1, 0xE381, 0x2340, 0xE101, 0x21C0, 0x2080, 0xE041,
  0xA001, 0x60C0, 0x6180, 0xA141, 0x6300, 0xA3C1, 0xA281, 0x6240,
  0x6600, 0xA6C1, 0xA781, 0x6740, 0xA501, 0x65C0, 0x6480, 0xA441,
  0x6C00, 0xACC1, 0xAD81, 0x6D40, 0xAF01, 0x6FC0, 0x6E80, 0xAE41,
  0xAA01, 0x6AC0, 0x6B80, 0xAB41, 0x6900, 0xA9C1, 0xA881, 0x6840,
  0x7800, 0xB8C1, 0xB981, 0x7940, 0xBB01, 0x7BC0, 0x7A80, 0xBA41,
  0xBE01, 0x7EC0, 0x7F80, 0xBF41, 0x7D00, 0xBDC1, 0xBC81, 0x7C40,
  0xB401, 0x74C0, 0x7580, 0xB541, 0x7700, 0xB7C1, 0xB681, 0x7640,
  0x7200, 0xB2C1, 0xB381, 0x7340, 0xB101, 0x71C0, 0x7080, 0xB041,
  0x5000, 0x90C1, 0x9181, 0x5140, 0x9301, 0x53C0, 0x5280, 0x9241,
  0x9601, 0x56C0, 0x5780, 0x9741, 0x5500, 0x95C1, 0x9481, 0x5440,
  0x9C01, 0x5CC0, 0x5D80, 0x9D41, 0x5F00, 0x9FC1, 0x9E81, 0x5E40,
  0x5A00, 0x9AC1, 0x9B81, 0x5B40, 0x9901, 0x59C0, 0x5880, 0x9841,
  0x8801, 0x48C0, 0x4980, 0x8941, 0x4B00, 0x8BC1, 0x8A81, 0x4A40,
  0x4E00, 0x8EC1, 0x8F81, 0x4F40, 0x8D01, 0x4DC0, 0x4C80, 0x8C41,
  0x4400, 0x84C1, 0x8581, 0x4540, 0x8701, 0x47C0, 0x4680, 0x8641,
  0x8201, 0x42C0, 0x4380, 0x8341, 0x4100, 0x81C1, 0x8081, 0x4040
];

function dec2bin(dec){
  return (dec >>> 0).toString(2);
}

const CRC16Byte = (crc, data) => {
  val0 = (crc >> 8);
  val1 = (crc ^ data);

  val2 = ((crc ^ data) & 0xff);

  return ((crc >> 8) ^ crc16Table[(crc ^ data) & 0xff]);
}

const CRC16Sum = (buffer, len) => {
  pos = 0;
  crc = 0;

  while(len-- > 0) {
    crc = CRC16Byte(crc, buffer[pos++]);
  }

  return crc;
}

// Ports: 7169 7171 7272, 7170, 7270, 7070

const code = {
  MODE_BYTE: 0xE0,
  COMMAND_CHECK_BACK: 0xF3,
  END_MESSAGE: 0xF6,
  TIME_UPDATE: 0xF8,
  ACK_SLAVE: 0xFA,
  NO_DATA_RESPONSE: 0xF1,
  INDICATION_DATA_RESPONSE: 0xF2,
  POLL: 0xFB,
  COMMAND: 0xFC,
  RECALL: 0xFD,
  EXECUTE: 0xFE
}

class Genisys extends Protocol {

  constructor(address, port, remoteId, listenmode, cb) {
    super(new Date());

    this.address = address;
    this.port = +port;
    this.remoteId = +remoteId;
    this.listenmode = listenmode;
    this.cb = cb;
    this.onData = this.onData.bind(this);
    this.comm = new UDPSocket(this.port, this.onData);
    this.channel = this.comm.getChannel();
    console.log(`@@@ Genisys inicializado para remoto ${this.remoteId}, address: ${this.address}, port: ${this.port}, listenmode: ${this.listenmode}`);
  }

  buildMessagePollWithoutCRC() {
    const message = Buffer.allocUnsafe(3);

    message[0] = code['POLL'];
    message[1] = this.remoteId;
    message[2] = code['END_MESSAGE'];

    return message;
  }

  buildMessage(type, port, value) {
    if(!value) {
      const message = Buffer.allocUnsafe(5);

      message[0] = code[type];
      message[1] = this.remoteId;
      const crc = CRC16Sum(message, 2);
      message[2] = (crc & 0xFF);
      message[3] = ((crc >> 8) & 0xFF);
      message[4] = code['END_MESSAGE'];

      return message;
    }
    else {
      let msg = [...[code[type], this.remoteId], port, value, ...[code['MODE_BYTE'], 0x01]];
      const crc = CRC16Sum(msg, msg.length);
      msg = [...msg, crc & 0xFF, (crc >> 8) & 0xFF, 0xF6];

      const message = Buffer.from(msg, 'hex');

      return message;
    }
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

  sendACK() {
    const message = this.buildMessage('ACK_SLAVE');
    this.send(message);
  }

  sendPoll() {
    console.debug(`sendPoll for Remote ${this.remoteId} - available: ${this.available}`);
    if(this.available) {
      this.available = false;
      this.time = new Date();
      if(global.gInterface && global.gInterface.POLL_WITHOUT_CRC) {
        const message = this.buildMessagePollWithoutCRC();
        this.send(message);
      }
      else {
        const message = this.buildMessage('POLL');
        this.send(message);
      }
    }
  }

  sendRecall() {
    console.debug(`sendRecall for Remote ${this.remoteId} - available: ${this.available}`);
    if(this.available) {
      this.available = false;
      this.time = new Date();
      const message = this.buildMessage('RECALL');
      this.send(message);
    }
  }

  sendCommand(data) {
    if(this.available) {
      this.available = false;
      this.time = new Date();
      const message = this.buildMessage('COMMAND', data.port-1, data.value);
      this.send(message);
    }
  }

  sendExecute() {
    const message = this.buildMessage('EXECUTE');
    this.send(message);
  }

  updateTime() {
    const date = new Date();
    const currentDate = [0xA0, 
                          date.getSeconds(), 
                          date.getMinutes(), 
                          date.getHours(), 
                          date.getDate(), 
                          date.getMonth()+1, 
                          date.getFullYear() & 0xFF, 
                          date.getFullYear() >> 8];
    const message = this.buildMessage('TIME_UPDATE', currentDate);
    this.send(message);
  }

  handleResponseData(message) {
    if(message && message.length >= 3) {
      const responseCode = +message[0];
      const responseRemoteId = +message[1];

      if(this.remoteId === responseRemoteId) {
        console.log(`< ${Protocol.toHexString(message)}`);

        const unscapedMessage = UnescapeMessage(message);

        console.debug(`< unscaped: ${Protocol.toHexString(unscapedMessage)}`);

        if(code['INDICATION_DATA_RESPONSE'] === responseCode) {
          const indication = unscapedMessage.slice(2, unscapedMessage.length - 3);
          let idx = 0;

          while((idx+1) < indication.length) {
            indication[idx]++;
            idx += 2;
          }

          this.sendACK();
          if(this.cb) {
            this.cb(indication);
          }
        }
        else if(code['NO_DATA_RESPONSE'] === responseCode) {
          this.available = true;
          if(this.cb) {
            this.cb(responseCode);
          }
        }
        else if(code['COMMAND_CHECK_BACK'] === responseCode) {
          this.sendExecute();
        }
      }
    }
  }

  static getCode(value) {
    return code[value];
  }

  onData(msg, rinfo) {
    this.handleResponseData(msg);
  }
}
module.exports = Genisys;