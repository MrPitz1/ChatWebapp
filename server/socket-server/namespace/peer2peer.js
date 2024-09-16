const { addSocketToRoom, removeSocketFromRoom, getSocketIDsInRoom } = require('../redis/helpers');

module.exports = (io, redisClient) => {
  const peer2peerNamespace = io.of('/socket/p2p');

  peer2peerNamespace.on('connection', (socket) => {
    /**
     * Handle when a client joins a room.
     * Adds the socket ID to the Redis set for the room and notifies other users in the room.
     */
    socket.on('join room', async (roomID) => {
      /**
       * Add the socket to the local instance's room and also
       * to the Redis key-value store. This allows us to keep track
       * of all users across different instances, since the adapter
       * only tracks users on the local instance.
       */
      socket.join(roomID);
      await addSocketToRoom(`room:${roomID}`, socket.id, redisClient);

      const otherUsers = await getSocketIDsInRoom(roomID, redisClient);
      const otherUser = otherUsers.find(id => id !== socket.id);

      /**
       * If there is another user in the room, notify them of the new user
       * and send the other user's socket ID back to the requesting client
       */
      if (otherUser) {
        socket.emit("other user", otherUser);
        // Notify the other user about the new user joining
        socket.to(otherUser).emit("user joined", socket.id);
      }
    });

    /**
     * Forward WebRTC offer signaling messages to the specified target user
     */
    socket.on('offer', (payload) => {
      socket.to(payload.target).emit('offer', payload);
    });

    /**
     * Forward WebRTC answer signaling messages to the specified target user
     */
    socket.on('answer', (payload) => {
      socket.to(payload.target).emit('answer', payload);
    });

    /**
     * Forward ICE candidate signaling messages to the specified target user
     */
    socket.on('ice-candidate', (incoming) => {
      socket.to(incoming.target).emit('ice-candidate', incoming.candidate);
    });

    /**
     * Handle socket disconnection,
     * removes the disconnected user from all rooms in the Redis store
     */
    socket.on('disconnect', async () => {
      /**
       * Disconnect user from all rooms
       */
      const rooms = await redisClient.keys('room:*');
      rooms.forEach(async (room) => {
        await removeSocketFromRoom(room, socket.id, redisClient);
      });
    });
  });
};