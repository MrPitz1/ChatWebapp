const express = require('express');
const Redis = require('ioredis');
const Cors = require('cors');
const http = require('http');
const { createAdapter } = require('@socket.io/redis-adapter');
const { Server } = require('socket.io');

// Environment variables
const port = process.env.PORT;
const redisHost = process.env.REDIS_HOST;
const redisPort = process.env.REDIS_PORT;

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

// Create Express application
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Create Socket.IO server
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

// Import namespace handlers
require('./namespace/allchat')(io);
require('./namespace/peer2peer')(io, redisClient);

// Start server
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
