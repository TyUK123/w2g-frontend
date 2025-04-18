const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

app.use(cors());

app.use(express.static(path.join(__dirname, '.')));

io.on('connection', (socket) => {
  console.log('User connected');

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    socket.roomId = roomId;

    const users = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
    io.to(roomId).emit('user-list', users);
    console.log(`User joined room: ${roomId}`);
  });

  socket.on('chat-message', (message) => {
    if (socket.roomId) {
      io.to(socket.roomId).emit('chat-message', message);
    }
  });

  socket.on('video-action', (data) => {
    if (socket.roomId) {
      socket.to(socket.roomId).emit('video-action', data);
    }
  });

  socket.on('load-video', (videoId) => {
    if (socket.roomId) {
      io.to(socket.roomId).emit('load-video', videoId);
    }
  });

  socket.on('disconnect', () => {
    if (socket.roomId) {
      const users = Array.from(io.sockets.adapter.rooms.get(socket.roomId) || []);
      io.to(socket.roomId).emit('user-list', users);
    }
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log('Server listening on port ' + PORT);
});
