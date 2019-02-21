const http = require('http');
const fs = require('fs');
const WebSocket = require('ws');
const express = require('express');

const app = express();
const server = http.Server(app);

const mjpegServer = require('mjpeg-server');

http.createServer(function(req, res) {
  console.log("Got request");

  const mjpegReqHandler = mjpegServer.createReqHandler(req, res);

  let ctr = 0;
  const max = 4;
  let direction = 1;

  function updateJPG() {
    fs.readFile(__dirname + '/theimage'+ ctr + '.jpeg', sendJPGData);
    ctr = ctr + direction;
    if (ctr < 0) {
      direction = 1;
      ctr = 0;
    }

    if (ctr > max) {
      direction = -1;
      ctr = max;
    }

  }

  const sendJPGData = (err, data) => {
    console.log(`sendJPGData err: ${err}`);
    mjpegReqHandler.write(data);
  };

  const timer = setInterval(updateJPG, 50);

}).listen(8081);