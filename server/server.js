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

// Redisadapter to share the socket connections
io.adapter(createAdapter(pubClient, subClient));

// Middleware to parse JSON bodies
app.use(express.json());
// Must have: Allow Cross Origin Request 
app.use(Cors());

io.on('connection', (socket) => {
    /*
        Connection init
    */
    console.log(`User connected: ${socket.id}`);
  
    socket.on('join', (room) => {
      /*
        Join Event: Add Socket to the /all-chat Room
      */
      socket.join(room);
      console.log(`Socket ${socket.id} joined room ${room}`);
      socket.to(room).emit('user-joined', socket.id);
    });
  
    socket.on('disconnect', (socket) => {
      /*
        Disconnect Event
      */
      console.log(`User disconnected: ${socket.id}`);
    });

    socket.on('chat-message', (data) => {
        /*
            Message Event: Send Message to all Sockets of the Room
        */
        const { message, room} = data;
        socket.to(room).emit('chat-message', message)
    })
  });
  
  // Start Server
  const PORT = process.env.PORT || port;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
  