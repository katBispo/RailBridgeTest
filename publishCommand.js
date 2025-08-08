const amqp = require('amqplib');
 
async function publishCommand() {
  try {
    const conn = await amqp.connect('amqp://localhost:5672');
    const ch = await conn.createChannel();
    const exchange = 'commandExchange';
    const routingKey = 'users.test';
    const payload = JSON.stringify({
      section: 4,
      remote: 2,
      type: 'command',
      port: 1,
      value: 1
    });
    await ch.assertExchange(exchange, 'topic', { durable: true });
    ch.publish(exchange, routingKey, Buffer.from(payload));
    console.log('Mensagem publicada:', payload);
    await ch.close();
    await conn.close();
  } catch (err) {
    console.error('Erro ao publicar:', err);
  }
}
 
publishCommand();