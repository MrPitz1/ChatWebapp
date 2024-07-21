const express = require('express');
const Redis = require('ioredis');
const Cors = require('cors');
const { Server: WebSocketServer } = require('ws');

const app = express();
const port = process.env.PORT || 4000;
const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = process.env.REDIS_PORT || 6379;

// Create Redis clients
const publisher = new Redis({
  host: redisHost,
  port: redisPort,
});

const subscriber = new Redis({
  host: redisHost,
  port: redisPort,
});

// Start Express server
const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

let connections = [];

// Middleware to parse JSON bodies
app.use(express.json());
// Middleware to allow requests from different locations
app.use(Cors());

// Create WebSocket server
const wss = new WebSocketServer({ server, path: '/all-chat' });

// Handle WebSocket connections
wss.on('connection', (ws) => {
    console.log('Client connected to /all-chat');

    // Handle incoming messages
    ws.on('message', (message) => {
        console.log(`Received message: ${message}`);
        // Publish the message to the Redis channel
        publisher.publish('chat_channel', message);
    });

    // Handle WebSocket close
    ws.on('close', () => {
        console.log('Client disconnected');
        connections = connections.filter(conn => conn !== ws);
    });

    // Send initial connection message
    ws.send('Connected successfully to server');
    connections.push(ws);
});

// Handle incoming messages from Redis
const handleRedisMessage = (channel, message) => {
    console.log(`Received message from Redis: ${message}`);
    // Broadcast message to all connected WebSocket clients
    connections.forEach(conn => {
        if (conn.readyState === conn.OPEN) {
            console.log('Sending message to WebSocket client');
            conn.send(message);
        }
    });
};

// Subscribe to Redis channel
subscriber.subscribe('chat_channel', (err) => {
    if (err) {
        console.error('Failed to subscribe to Redis channel:', err);
    } else {
        console.log('Subscribed to Redis channel "chat_channel"');
    }
});

subscriber.on('message', handleRedisMessage);

// Optional: Clean up on process exit
process.on('SIGINT', () => {
    console.log('Shutting down...');
    publisher.quit(); // Close the publisher connection
    subscriber.quit(); // Close the subscriber connection
    server.close(() => process.exit(0));
});
