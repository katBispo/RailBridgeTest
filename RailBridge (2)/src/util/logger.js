const path = require('path');
const winston = require('winston');
const { combine, timestamp, printf, json, errors } = winston.format;
require('winston-daily-rotate-file');

const filename = 'railbridge';
const datePattern = 'YYYYMMDD_HH';
const maxSize = '20m';
const maxFiles = '30d';

const consoleTransport = new (winston.transports.Console)({  
  format: combine(    
    timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSS' }),
    printf((info) => `${info.timestamp} [${info.level}]: ${info.message}`)
  ),
  level: 'info'
});

const transport = new (winston.transports.DailyRotateFile)({
  filename: path.join(__dirname, '..', '..', 'logs', `${filename}-%DATE%.log`),
  datePattern: datePattern,
  zippedArchive: true,
  maxSize: maxSize,
  maxFiles: maxFiles,
  frequency: null,
  level: 'info'
});

const transportError = new (winston.transports.DailyRotateFile)({
  filename: path.join(__dirname, '..', '..', 'logs', `${filename}-%DATE%.err`),
  datePattern: datePattern,
  zippedArchive: true,
  maxSize: maxSize,
  maxFiles: maxFiles,
  frequency: null,
  level: 'error'
});

const transportDebug = new (winston.transports.DailyRotateFile)({
  filename: path.join(__dirname, '..', '..', 'logs', `${filename}-%DATE%.debug`),
  datePattern: datePattern,
  zippedArchive: true,
  maxSize: maxSize,
  maxFiles: maxFiles,
  frequency: null,
  level: 'debug'
});

const logger = winston.createLogger({
  levels: winston.config.syslog.levels,
  format: combine(    
    timestamp(),
    json(),
    errors({ stack: true })
  ),
  transports: [
    consoleTransport,
    transport,
    transportError,    
    transportDebug
  ]
});

// Override the base console log with winston
console.log = (...args) => logger.info(`${args}`);
console.info = (...args) => logger.info(`${args}`);
console.error = (...args) => logger.error(`${args}`);
console.debug = (...args) => logger.debug(`${args}`);

module.exports = logger;