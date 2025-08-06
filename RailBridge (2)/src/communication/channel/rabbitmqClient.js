"use strict";

const { Connection, ConsumerStatus } = require('rabbitmq-client');
const { EventEmitter } = require('node:events');

let rabbit;
let consumer;

const setup = async (producerQueueName, producerExchangeName, producerExchangeType, messageTTL) => {
  try {
    console.log(`@@@ Setup: [${producerExchangeName}:${producerExchangeType} -> ${producerQueueName}:${messageTTL}]`);
    await rabbit.queueDeclare({
      queue: producerQueueName, 
      durable: true, 
      arguments: {'x-message-ttl' : +messageTTL} });

    await rabbit.exchangeDeclare({
      queue: producerQueueName, 
      exchange: producerExchangeName, 
      type: producerExchangeType, 
      durable: true});
    
    await rabbit.queueBind({
      queue: producerQueueName, 
      exchange: producerExchangeName});
  }
  catch(ex) {
    console.error(ex);
  }
}

class RabbitMQClient extends EventEmitter {
  constructor(connectionString, consumerExchangeName, consumerExchangeType, consumerQueueName, consumerRoutingKey, 
                                producerExchangeName, producerExchangeType, producerQueueName, producerRoutingKey, 
                                producerMaxAttempts, messageTTL,
                                cb) {
    super();                         
    // Initialize:
    rabbit = new Connection(connectionString);
    rabbit.on('error', (err) => {
      console.error('RabbitMQ connection error', err);
      this.emit('disconnect', err);
    });
    rabbit.on('connection', () => {
      console.log('RabbitMQ Connection successfully (re)established');
      if (producerQueueName && producerExchangeName) {
        setup(producerQueueName, producerExchangeName, producerExchangeType, messageTTL);
      }
      this.emit('connect');
    });

    this.producerExchangeName = producerExchangeName;

    this.consumer = null;
    if(consumerExchangeName && consumerExchangeName.length > 0) {
        // Consume messages from a queue:
        // See API docs for all options
        this.consumer = rabbit.createConsumer({
          lazy: true,
          queue: consumerQueueName,
          queueOptions: {durable: true, arguments: {'x-message-ttl' : +messageTTL}},
          // Optionally ensure an exchange exists
          exchanges: [{exchange: consumerExchangeName, type: consumerExchangeType, durable: true}],
          // With a "topic" exchange, messages matching this pattern are routed to the queue
          queueBindings: [{exchange: consumerExchangeName, routingKey: consumerRoutingKey}],
        }, async (msg) => {
          console.log(`@@@ Mensagem recebida na fila ${consumerQueueName}: ${msg.body.toString()}`);
          return cb(Buffer.from(msg.body).toString());
        // The message is automatically acknowledged (BasicAck) when this function ends.
        // If this function throws an error, then msg is rejected (BasicNack) and
        // possibly requeued or sent to a dead-letter exchange. You can also return a
        // status code from this callback to contr}ol the ack/nack behavior
        // per-message.
        });

      this.consumer.on('error', (err) => {
        console.error(`@@@ Erro no consumidor: ${err}`);
        // Maybe the consumer was cancelled, or the connection was reset before a
        // message could be acknowledged.
        console.error('consumer error', err);
      });    
      console.log(`@@@ Consumidor inicializado para exchange ${consumerExchangeName}, fila ${consumerQueueName}`); 
    }

    // Declare a publisher
    // See API docs for all options
    if(producerExchangeName && producerExchangeName.length > 0) {
      this.pub = rabbit.createPublisher({
        // Enable publish confirmations, similar to consumer acknowledgements
        confirm: true,
        // Enable retries
        maxAttempts: producerMaxAttempts,
        // Optionally ensure the existence of an exchange before we use it
        // exchanges: [{
        //   exchange: producerExchangeName, 
        //   type: producerExchangeType, 
        //   durable: true}],
        // queueBindings: [{
        //   exchange: producerExchangeName, 
        //   queue: producerQueueName}], //, routingKey: producerRoutingKey
        // queues: [{
        //   queue: producerQueueName,
        //   durable: true,
        //   arguments: {
        //     'x-message-ttl': +messageTTL
        //   }
        // }]
      });
    }
  }

  async produce(payload, routingKey) {
    try {      
      await this.pub.send({exchange: this.producerExchangeName, routingKey}, payload);
    }
    catch(ex) {
      console.error(ex);
    }

    // // Publish a message to a custom exchange
    // await pub.send(
    //   {exchange: 'my-events', routingKey: 'users.visit'}, // metadata
    //   {id: 1, name: 'Alan Turing'}) // message content

    // // Or publish directly to a queue
    // await pub.send('user-events', {id: 1, name: 'Alan Turing'})

  }

  isReady() {
    return rabbit.ready;
  }

  startConsumer() {
    this.consumer.start();
  }

  stopConsumer() {
    this.consumer.close();
  }
}

// Clean up when you receive a shutdown signal
// async function onShutdown() {
//   // Waits for pending confirmations and closes the underlying Channel
//   await consumer.close();
//   // Stop consuming. Wait for any pending message handlers to settle.
//   await rabbit.close();
// }

// process.on('SIGINT', onShutdown);
// process.on('SIGTERM', onShutdown);

module.exports = RabbitMQClient;