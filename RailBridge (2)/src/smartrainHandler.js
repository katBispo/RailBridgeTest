"use strict";

const Protocol = require('./communication/protocol/protocol');

const dgram = require('dgram');
const multicastClient = dgram.createSocket('udp4');

const MIN_MESSAGE_LEN = 53;
const ASCII_REF_VALUE = 48;
const FULL_STATUS_DATA_START = 60;

const type = {
    INDICATION: 0x0E,
    COMMAND: 0x0B
}

const messageCode = {
    FullStatusMsg: 0x05,
    StatusMsg: 0x06,
    AlarmMsg: 0x07,
    CommandMsg: 0x01
}

const smartrainHandler = (host, multicastip, port, cb) => {
    multicastClient.on('listening', () => {
        const address = multicastClient.address();
        console.debug(`Listening smartrain messages on ${address.address}:${address.port}`);
        multicastClient.setBroadcast(true)
        multicastClient.setMulticastTTL(128); 
        multicastClient.addMembership(multicastip, host); //Local IP Address
    });
    
    multicastClient.on('message', (message, remote) => {
        console.log(`smartrain message received: ${Protocol.toHexString(message)} from: ${JSON.stringify(remote)}`);

        const indicationInfo = {};

        if(message.length >= MIN_MESSAGE_LEN) {
            let section;
            let messageCodeValue;
            let remote;
            let port;
            let value;
            let dataCount;

            const typeValue = +message[7] & 0xFF;

            if(typeValue === type['INDICATION']) {
                indicationInfo['typeValue'] = 'INDICATION';

                section = +message[15] - ASCII_REF_VALUE;

                indicationInfo['section'] = section;


                if(+message[55] === 0x00) {
                    messageCodeValue = +message[56] & 0xFF;
    
                    if(messageCodeValue === messageCode['FullStatusMsg']) {
                        indicationInfo['messageType'] = 'FullStatusMsg';

                        remote = +message[58] & 0xFF;
                        dataCount = +message[59] & 0xFF;
                        indicationInfo['remote'] = remote;
                        indicationInfo['dataCount'] = dataCount;
    
                        const data = message.slice(FULL_STATUS_DATA_START);

                        indicationInfo['data'] = data;

                        console.debug(`indicationInfo: ${JSON.stringify(indicationInfo)}`);

                        const res = {section, remote, full: true, connected: true, changed: []};
                        for(let i = 0; i < dataCount; i++) {
                            res.changed.push({index: i, value: data[i]})
                        }

                        if(cb) {
                            cb(res);
                        }
                        else {
                            console.debug(`Callback funcion is undefined`);
                        }
                    }
                    else if(messageCodeValue === messageCode['StatusMsg']) {
                        indicationInfo['messageType'] = 'StatusMsg';

                        dataCount = +message[57] & 0xFF;
                        indicationInfo['dataCount'] = dataCount;
    
                        remote = +message[58] & 0xFF;
                        port = +message[59] & 0xFF;
                        value = +message[60] & 0xFF;
    
                        indicationInfo['remote'] = remote;
                        indicationInfo['port'] = port;
                        indicationInfo['value'] = value;

                        console.debug(`indicationInfo: ${JSON.stringify(indicationInfo)}`);

                        const res = {section, remote, full: false, connected: true, changed: [{index: port, value}]};
                        
                        if(cb) {
                            cb(res);
                        }
                        else {
                            console.debug(`Callback funcion is undefined`);
                        }
                    }
                    else if(messageCodeValue === messageCode['AlarmMsg']) {
                        indicationInfo['messageType'] = 'AlarmMsg';

                        dataCount = +message[57] & 0xFF;
                        indicationInfo['dataCount'] = dataCount;

                        remote = +message[59] & 0xFF;
                        indicationInfo['remote'] = remote;

                        console.debug(`indicationInfo: ${JSON.stringify(indicationInfo)}`);

                        const res = {section, remote, full: false, connected: false, changed: []};
                        if(cb) {
                            cb(res)
                        }
                        else {
                            console.debug(`Callback funcion is undefined`);
                        }
                    }
                    else {
                        console.debug(`message code is invalid for ${Protocol.toHexString(message)}`);
                    }
                }
            }
            else if(typeValue === type['COMMAND']) {
                indicationInfo['messageType'] = 'StatusMsg';
                section = +message[36] - ASCII_REF_VALUE;

                indicationInfo['section'] = section;

                if(+message[48] === 0x00) {
                    messageCodeValue = +message[49] & 0xFF;
    
                    if(messageCodeValue === messageCode['CommandMsg']) {
                        indicationInfo['messageCodeValue'] = 'CommandMsg';
                        dataCount = +message[50] & 0xFF;
                        indicationInfo['dataCount'] = dataCount;
    
                        remote = +message[51] & 0xFF;
                        port = +message[52] & 0xFF;
                        value = +message[53] & 0xFF;

                        indicationInfo['remote'] = remote;
                        indicationInfo['port'] = port;
                        indicationInfo['value'] = value;

                        console.debug(`commandInfo: ${JSON.stringify(indicationInfo)}`);

                        const res = {section, remote, port, value};
                        console.log(`Received command from SGF: ${JSON.stringify(res)}`);

                        if(cb) {
                            cb(res)
                        }
                        else {
                            console.debug(`Callback funcion is undefined`);
                        }
                    }
                }
                else {
                    console.debug(`message code is invalid for ${Protocol.toHexString(message)}`);
                }
            }
        }
        else {
            console.debug(`message rejected: ${Protocol.toHexString(message)}`);
        }
    });
    
    console.debug(`multicastClient.port: ${port}`);
    console.debug(`multicastClient.host: ${host}`);

    // multicastClient.bind({ address: host, port, exclusive: true });
    multicastClient.bind(port, host);
}

module.exports = smartrainHandler;