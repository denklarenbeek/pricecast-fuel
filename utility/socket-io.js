const socket_io = require('socket.io');
const io = socket_io();
const socketApi = {};

socketApi.io = io;

io.on('connection', (socket) => {
  console.log(`A user is connected: [id=${socket.id}]`);
});

socketApi.sendNotification = (jobId, status, data, user) => {

  io.sockets.emit('reportstatus', {jobId, status, data, user})

  if(status === 'error') {
    console.log('some error has occurred', data);
  }
}

module.exports = socketApi;