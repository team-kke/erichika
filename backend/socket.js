"use strict";

var debug = require('debug')('socket');
var io = require('socket.io')();

exports.attach = function (server) {
  io.attach(server);
};

var sessionParser = null;
exports.setSessionParser = function (parser) {
  sessionParser = parser;
};

io.on('connection', function (socket) {
  if (!sessionParser) {
    console.log('no session parser!');
    socket.disconnect();
    return;
  }

  debug('+1 socket connection');
  sessionParser(socket, function (err, session) {
    if (err || !session) {
      socket.disconnect();
      return;
    }

    io.emit('test', { message: 'Hey, everyone! +1 connection' });
    socket.on('test', function (data) {
      debug('received: %s', data);
    });
    socket.on('disconnect', function () {
      debug('-1 socket connection');
    });
  });
});
