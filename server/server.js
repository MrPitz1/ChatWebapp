const express = require('express');
const Redis = require('ioredis');
const Cors = require('cors');
const http = require('http');
const { createAdapter } = require('@socket.io/redis-adapter');
const { Server } = require('socket.io');

const app = express();
const port = process.env.PORT || 4000;
const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = process.env.REDIS_PORT || 6379;

// Create redis clients
const pubClient = new Redis({
  host: redisHost,
  port: redisPort,
});

const subClient = new Redis({
  host: redisHost,
  port: redisPort,
});

const redisClient = new Redis({
  host: redisHost,
  port: redisPort,
});

// Create servers
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middlewares
app.use(express.json());
app.use(Cors());

// Redis setup
io.adapter(createAdapter(pubClient, subClient));

// Helper functions for room management
async function addSocketToRoom(room, socketId) {
  await redisClient.sadd(room, socketId);
}
async function removeSocketFromRoom(room, socketId) {
  await redisClient.srem(room, socketId);
}
async function getRoomMembers(room) {
  return await redisClient.smembers(room);
}

// Define the /all-chat namespace
const allChatNamespace = io.of('/all-chat');

// Client Server Architecture
allChatNamespace.on('connection', (socket) => {
  /*
      Connection init
  */
  console.log(`User connected to /all-chat: ${socket.id}`);
  
  socket.on('join', (room) => {
    /*
      Join Event: Add Socket to the /all-chat Room
    */
    socket.join(room);
    console.log(`Socket ${socket.id} joined room ${room}`);
    socket.to(room).emit('user-joined', socket.id);
  });

  socket.on('disconnect', () => {
    /*
      Disconnect Event
    */
    console.log(`User disconnected from /all-chat: ${socket.id}`);
  });

  socket.on('chat-message', (data) => {
    /*
        Message Event: Send Message to all Sockets of the Room
    */
    const { message, room } = data;
    socket.to(room).emit('chat-message', message);
  });
});


// P2P namespace
const peer2peerNamespace = io.of('/p2p');

// Peer to peer architecture
peer2peerNamespace.on('connection', (socket) => {
  /*
      Connection init
  */
  socket.on('join room', async (roomID) => {
    /*
      Join Event: Add Socket to the /all-chat Room
    */
    // Add to room with redis adapter
    socket.join(roomID);

    /* 
    Add sockets to the room with a Redis Key-Value Store. This might seem redundant,
    but it's necessary because Redis Rooms don't support retrieving sockets across 
    all backend instances; they only return sockets on the local backend instance. 
    */
    await addSocketToRoom(`room:${roomID}`, socket.id);

    // Check if the room already has other users
    const otherUsers = await redisClient.smembers(`room:${roomID}`);
    const otherUser = otherUsers.find(id => id !== socket.id);

    if (otherUser) {
      // Notify the new user of the existing user
      socket.emit("other user", otherUser);
      // Notify the existing user that a new user has joined
      socket.to(otherUser).emit("user joined", socket.id);
    }
  });

  socket.on('offer', (payload) => {
    /* 
    Offer event
    */
    socket.to(payload.target).emit('offer', payload);
  });

  socket.on('answer', (payload) => {
    /*
    Anser event
    */
    socket.to(payload.target).emit('answer', payload);
  });

  socket.on('ice-candidate', (incoming) => {
    /*
    ice candidate event
    */
    socket.to(incoming.target).emit('ice-candidate', incoming.candidate);
  });

  socket.on('disconnect', async () => {
    /*
      Disconnect Event
    */
    // Remove socket from all rooms in Redis Key Value Store
    const rooms = await redisClient.keys('room:*');
    rooms.forEach(async (room) => {
      await  removeSocketFromRoom(room, socket.id);
    });
  });
});

// Start Server
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});