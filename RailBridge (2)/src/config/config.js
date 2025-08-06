// const _ = require('lodash');

// Para Ethernet
// pollInterval: Tempo de loop para interrogar remotas
// recallFrequency: a cada quantas interações no definido por pollInterval deve-se pedir recall
// disconnectPeriod: Quantas interrogações sem respostas são necessárias para informar o Core Servers que a remota está desconectada
// timeoutLimit: Tempo máximo para resposta da interrogação do campo 

require('dotenv').config();

// module variables
const config = require('./config.json');
let interfaceType = process.argv[2];

if(!interfaceType) {
  interfaceType = 'ethernet';
  console.debug(`Changed to ethernet`);
}

const interfaceEnv = require(`./${interfaceType}.json`); 

// const defaultConfig = config.development;
const environment = process.env.NODE_ENV || 'development';
const environmentConfig = config[environment];
const interfaceConfig = interfaceEnv[environment];

interfaceConfig[interfaceType] = true;

// const finalConfig = _.merge(defaultConfig, interface);

console.debug(`NODE_ENV: ${process.env.NODE_ENV}`);
console.debug(`environment: ${environment}`);
// console.debug(`interfaceConfig: ${JSON.stringify(interfaceConfig)}`);

// as a best practice
// all global variables should be referenced via global. syntax
// and their names should always begin with g
global.gConfig = environmentConfig;
global.gInterface = interfaceConfig;

// log global.gConfig
// console.log(`global.gConfig: ${JSON.stringify(global.gConfig, undefined, global.gConfig.json_indentation)}`);
