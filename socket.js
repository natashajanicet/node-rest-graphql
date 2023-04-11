const { Server } = require('socket.io');

let io;

module.exports = {
  init: (server) => {
    io = new Server(server, {
      cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
        withCredentials: true,
      },
    });
    return io;
  },
  getIO: () => {
    if (!io) {
        throw new Error('Socket.io not initialized')
    }
    return io;
  }
};
