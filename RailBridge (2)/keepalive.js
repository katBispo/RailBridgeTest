const { Server } = require('socket.io');
const io = new Server(3091, { cors: { origin: '*' } });
const keepaliveNamespace = io.of('/keepalive');
keepaliveNamespace.on('connection', (socket) => {
  console.log('Cliente conectado ao namespace /keepalive:', socket.id);
  socket.on('register', (data) => {
    console.log('Registrado:', data);
    socket.emit('keepalive', { status: 'active' });
    socket.emit('activate'); // Envia o comando activate
  });
  socket.on('metrics', (data) => {
    console.log('Métricas recebidas:', data);
  });
  socket.on('disconnect', () => {
    console.log('Cliente desconectado do namespace /keepalive:', socket.id);
  });
});
console.log('Servidor Socket.IO rodando em http://localhost:3091/keepalive');