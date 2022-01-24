const socket_io = require('socket.io');
const io = socket_io();
const socketApi = {};

socketApi.io = io;

io.on('connection', (socket) => {
  console.log('A user is connected');
});

socketApi.sendNotification = (jobId, status, data) => {
  
  io.sockets.emit('reportstatus', {jobId, status, data})
}

module.exports = socketApi;