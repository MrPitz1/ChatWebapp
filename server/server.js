var os = require("os");
const express = require("express");
const http = require("http");
var socketIO = require("socket.io");
const Cors = require('cors');
var app = express();
var server = http.createServer(app);

var io = socketIO(server);

app.use(express.static("public"));
app.use(express.json());
app.use(Cors());

server.listen(process.env.PORT || 4000, () => {
  console.log(`Server is listening on port ${process.env.PORT || 4000}`);
});

io.on("connection", function (socket) {
  console.log("A client connected: ", socket.id);

  function log() {
    var array = ["Message from server:"];
    array.push.apply(array, arguments);
    socket.emit("log", array);
  }

  socket.on("message", function (message, room) {
    log("Client said: ", message);
    socket.to(room).emit("message", message);
  });

  socket.on("create", function (room, clientName) {
    console.log("Received request to create room " + room);

    var clientsInRoom = io.sockets.adapter.rooms.get(room); // Nutzung der get-Methode
    console.log(clientsInRoom);
    var numClients = clientsInRoom ? clientsInRoom.size : 0;
    console.log("Room " + room + " now has " + numClients + " client(s)");

    if (numClients === 0) {
      socket.join(room);
      console.log("Client ID " + socket.id + " created room " + room);
      socket.emit("created", room, socket.id);
      io.sockets.in(room).emit("creatorname", clientName);
    } else {
      socket.emit("full", room);
    }
  });

  socket.on("join", function (room, clientName) {
    log("Received request to join room " + room);

    var clientsInRoom = io.sockets.adapter.rooms.get(room); // Nutzung der get-Methode
    console.log(clientsInRoom);
    var numClients = clientsInRoom ? clientsInRoom.size : 0;
    log("Room " + room + " now has " + numClients + " client(s)");
    console.log(numClients);
    if (numClients === 1) {
      socket.join(room);
      console.log("Client ID " + socket.id + " joined room " + room);
      io.sockets.in(room).emit("join", room, clientName);
      socket.emit("joined", room, socket.id);
      io.sockets.in(room).emit("ready");
    } else if (numClients > 1) {
      socket.emit("full", room);
    } else {
      socket.emit("notfound", room);
    }
  });

  socket.on("creatorname", (room, client) => {
    socket.to(room).emit("mynameis", client);
  });

  socket.on("ipaddr", function () {
    var ifaces = os.networkInterfaces();
    for (var dev in ifaces) {
      if (ifaces.hasOwnProperty(dev)) {
        ifaces[dev].forEach(function (details) {
          if (details.family === "IPv4" && details.address !== "127.0.0.1") {
            socket.emit("ipaddr", details.address);
          }
        });
      }
    }
  });

  socket.on("bye", function () {
    console.log("received bye");
  });
});
