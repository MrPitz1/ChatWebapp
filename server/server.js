// Loading dependencies & initializing express
var os = require("os");
const Cors = require('cors');
var express = require("express");
var app = express();
const Redis = require('ioredis');
const redis = new Redis({
  host: process.env.REDIS_HOST || 'redis',
  port: process.env.REDIS_PORT || 6379
});
var http = require("http");
// For signalling in WebRTC
var socketIO = require("socket.io");

app.use(express.static("public"));
app.use(express.json());
// Middleware to allow requests from different locations
app.use(Cors());
var server = http.createServer(app);

server.listen(process.env.PORT || 4000);

var io = socketIO(server);

io.sockets.on("connection", function (socket) {
  // Convenience function to log server messages on the client.
  // Arguments is an array like object which contains all the arguments of log().
  // To push all the arguments of log() in array, we have to use apply().
  function log() {
    var array = ["Message from server:"];
    array.push.apply(array, arguments);
    socket.emit("log", array);
  }

  // Defining Socket Connections
  socket.on("message", function (message, room) {
    log("Client said: ", message);
    // for a real app, would be room-only (not broadcast)
    socket.to(room).emit("message", message, room);
  });

  socket.on("create or join", function (room, clientName) {
    log("Received request to create or join room " + room);

    var clientsInRoom = io.sockets.adapter.rooms.get(room);
    var numClients = clientsInRoom ? clientsInRoom.size : 0;
    log("Room " + room + " now has " + numClients + " client(s)");

    if (numClients === 0) {
      socket.join(room);
      log("Client ID " + socket.id + " created room " + room);
      socket.emit("created", room, socket.id);
    } else if (numClients === 1) {
      socket.join(room);
      log("Client ID " + socket.id + " joined room " + room);
      // this message ("join") will be received only by the first client since the client has not joined the room yet
      io.sockets.in(room).emit("join", room, clientName); // this client name is the name of the second client who wants to join
      // this message will be received by the second client
      socket.emit("joined", room, socket.id);
      // this message will be received by two clients after the join of the second client
      io.sockets.in(room).emit("ready");
    } else {
      // max two clients
      socket.emit("full", room);
    }
  });

  socket.on("creatorname", (room, client) => {
    // to all clients in room except the sender
    socket.to(room).emit("mynameis", client);
  });

  socket.on("ipaddr", function () {
    var ifaces = os.networkInterfaces();
    for (var dev in ifaces) {
      ifaces[dev].forEach(function (details) {
        if (details.family === "IPv4" && details.address !== "127.0.0.1") {
          socket.emit("ipaddr", details.address);
        }
      });
    }
  });

  socket.on("bye", function () {
    console.log("received bye");
  });
});

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
