module.exports = (io) => {
  const allChatNamespace = io.of('/socket/all-chat');

  allChatNamespace.on('connection', (socket) => {
      console.log(`User connected to /all-chat: ${socket.id}`);

      socket.on('join', (room) => {
          /**
           * Handle a client joining a chat room,
           * adds the socket to the specified room and notifies other users in the room
           */
          socket.join(room);
          console.log(`Socket ${socket.id} joined room ${room}`);
          socket.to(room).emit('user-joined', socket.id);
      });

      socket.on('disconnect', () => {
          /**
           * Handle socket disconnection,
           * user is automaticly disconnected from socket-adapter
           */
          console.log(`User disconnected from /all-chat: ${socket.id}`);
      });

      socket.on('chat-message', (data) => {
          /**
           * Forward chat messages to the specified room,
           * broadcasts the message to all users in the room except the sender
           */
          const { message, room } = data;
          socket.to(room).emit('chat-message', message);
      });
  });
};
