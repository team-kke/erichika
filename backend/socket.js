"use strict";

var debug = require('debug')('socket');
var error = require('debug')('error');
var io = require('socket.io')();
var route = {
  game: require('./sockets/game'),
  lobby: require('./sockets/lobby'),
  queue: require('./sockets/queue')
};

exports.attach = function (server) {
  io.attach(server);
};

var sessionParser = null;
exports.setSessionParser = function (parser) {
  sessionParser = parser;
};

io.on('connection', function (socket) {
  if (!sessionParser) {
    error('no session parser!');
    socket.disconnect();
    return;
  }

  debug('+1 socket connection');
  socket.on('disconnect', function () {
    debug('-1 socket connection');
  });

  sessionParser(socket, function (err, session) {
    if (err || !session) {
      socket.disconnect();
      return;
    }

    socket.username = session.username;

    route.game(socket);
    route.lobby(socket);
    route.queue(socket);
  });
});
