const http = require('http');
const fs = require('fs');
const path = require('path');

const WebSocket = require('ws');
const express = require('express');

const app = express();
const server = http.Server(app);

const wss = new WebSocket.Server({
    server,
});

const broadcast = (err, data) => {
    if (err) {
        console.log('err');
        return;
    }

    console.log(`broadcasting data.byteLength: ${data.byteLength}`);
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
};

wss.on('connection', (socket) => {
    console.log('Connection added');
});

let ctr = 0;
const max = 4;
let direction = 1;
setInterval(() => {
    fs.readFile(__dirname + '/theimage'+ ctr + '.jpeg', broadcast);
    ctr = ctr + direction;
    if (ctr < 0) {
        direction = 1;
        ctr = 1;
    }

    if (ctr > max) {
        direction = -1;
        ctr = max-1;
    }
}, 33);

server.listen(8015, () => {
    console.log('listening on 8015');
});