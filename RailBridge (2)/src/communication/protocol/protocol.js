class Protocol {
  constructor(time) {
    this.time = time;
    this.available = true;
  }

  resetState() {
    this.available = true;
  }

  getTimeSpent() {
    const currentTime = new Date();
    return currentTime - this.time 
  }

  CRC16Sum(buffer, len) {
    let pos = 0;
    let crc = 0;
  
    while(len-- > 0) {
      crc = CRC16Byte(crc, buffer[pos++]);
    }
  
    return crc;
  }

  escapeMessage(originalMessage) {
    let escapedMessageLen = 0;
    const escapedMessage = [];
    let res = originalMessage;
  
    for (let i = 0; i < originalMessage.length; i++) {
      escapedMessageLen += ((i > 0) && (i < (originalMessage.length - 1)) && ((originalMessage[i] & 0xF0) == 0xF0)) ? 2 : 1;
    }
  
    if(escapedMessageLen > originalMessage.length) {
      let index = 0;
      for (let i = 0; i < originalMessage.length; i++) {
        if (((i > 0) && (i < (originalMessage.length - 1)) && ((originalMessage[i] & 0xF0) == 0xF0)))
        {
          escapedMessage[index++] = 0xF0;
          escapedMessage[index++] = (originalMessage[i] & 0x0F);
        }
        else {
          escapedMessage[index++] = originalMessage[i];
        }
      }
  
      res = escapedMessage;
    }
  
    return res;
  }
  
  UnescapeMessage(escapedMessage) {
    let res = escapedMessage;
    let originalMessageLen = 0;

    for (let i = 0; i < escapedMessage.length; i++) {
      if (escapedMessage[i] != 0xF0) {
        ++originalMessageLen;
      }
    }

    if(originalMessageLen < escapedMessage.length) {
      let index = 0;
      const originalMessage = new Array(originalMessageLen);

      for (let i = 0; i < length; ++i) {
        if (escapedMessage[i] == 0xF0 && i < (length - 1)) {
          originalMessage[index++] = (0xF0 | escapedMessage[++i]);
        }
        else {
          originalMessage[index++] = escapedMessage[i];
        }
      }

      res = originalMessage;
    }
  }

  static toHexString(byteArray) {
    if(byteArray.length > 1) {
      return Array.from(byteArray, function(byte) {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
      }).join(' ');
    }
    else {
      return byteArray;
    }
  }
}

module.exports = Protocol;