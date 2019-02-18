const http = require('http');
const fs = require('fs');
const WebSocket = require('ws');
const express = require('express');

const app = express();
const server = http.Server(app);

const wss = new WebSocket.Server({
  server,
});

const broadcast = (data) => {
  console.log('broadcasting');
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

wss.on('connection', (socket) => {
  console.log('Connection added');

  const filename = 'theimage.jpg';
  fs.readFile(filename, function (err, data) {
    if (err) throw err;

    console.log('got data from '+filename);
    setInterval(() => {
      broadcast(data);
    }, 1000/33);
  });
});

server.listen(8015, () => {
  console.log('listening on 8015');
});