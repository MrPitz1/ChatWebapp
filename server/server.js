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

// Create Redis clients
const pubClient = new Redis({
  host: redisHost,
  port: redisPort,
});

const subClient = new Redis({
  host: redisHost,
  port: redisPort,
});

// Create HTTP server
const server = http.createServer(app);

// Create Socket.IO server
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust this according to your needs
    methods: ["GET", "POST"]
  }
});

// Use Redis adapter to share the socket connections
io.adapter(createAdapter(pubClient, subClient));

// Middleware to parse JSON bodies
app.use(express.json());
// Must have: Allow Cross Origin Request 
app.use(Cors());

// Define the /all-chat namespace
const allChatNamespace = io.of('/all-chat');

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

const peer2peerNamespace = io.of('/p2p');

peer2peerNamespace.on('connection', (socket) => {
  console.log(`User connected to /p2p ${socket.id}`);
  
  socket.on('join', (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room ${room}`);
    socket.to(room).emit('you-are-caller');
  });

  socket.on('you-are-callee', (room) => {
    console.log('Emitting you-are-callee to room:', room);
    socket.to(room).emit('you-are-callee');
  });

  socket.on('offer', ({ room, sdp }) => {
    console.log('Emitting offer to room:', room);
    socket.to(room).emit('offer', sdp);
  });

  socket.on('answer', ({ room, sdp }) => {
    console.log('Emitting answer to room:', room);
    socket.to(room).emit('answer', sdp);
  });

  socket.on('candidate', ({ room, candidate }) => {
    console.log('Emitting candidate to room:', room);
    socket.to(room).emit('candidate', candidate);
  });
});


// Start Server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
