const express = require('express');
const Redis = require('ioredis');
const Cors = require('cors');
const app = express();
const redis = new Redis({
  host: process.env.REDIS_HOST || 'redis',
  port: process.env.REDIS_PORT || 6379
});

// Middleware to parse JSON bodies
app.use(express.json());
// Middlewar to allow requests from different locations
app.use(Cors());

// Endpoint to set a value in Redis
app.post('/set-name', async (req, res) => {
  const { name } = req.body;
  try {
    await redis.set('name', name);
    res.send(`Name set to: ${name}`);
  } catch (err) {
    console.error('Error setting name in Redis:', err);
    res.status(500).send('Error setting name in Redis');
  }
});

// Endpoint to get a value from Redis
app.get('/get-name', async (req, res) => {
  try {
    const name = await redis.get('name');
    res.send(`Name from Redis: ${name}`);
  } catch (err) {
    console.error('Error getting name from Redis:', err);
    res.status(500).send('Error getting name from Redis');
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
