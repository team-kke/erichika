"use strict";

var debug = require('debug')('socket');
var error = require('debug')('error');
var io = require('socket.io')();
var room = require('./room');

exports.attach = function (server) {
  io.attach(server);
};

var sessionParser = null;
exports.setSessionParser = function (parser) {
  sessionParser = parser;
};

function initialize(socket) {
  socket.on('lobby/connect', function () {
    var lobby = room.get('lobby');

    lobby.join(socket);

    var updateUserList = function () {
      var userList = lobby.sockets.map(function (userSocket) {
        return {
          username: userSocket.username,
          me: userSocket.username === socket.username
        };
      });
      socket.emit('lobby/userList', {userList: userList});
    };

    socket.on('lobby/join', updateUserList);
    socket.on('lobby/leave', updateUserList);
  });

  socket.on('disconnect', function () {
    debug('-1 socket connection');
  });
}

io.on('connection', function (socket) {
  if (!sessionParser) {
    error('no session parser!');
    socket.disconnect();
    return;
  }

  debug('+1 socket connection');
  sessionParser(socket, function (err, session) {
    if (err || !session) {
      socket.disconnect();
      return;
    }

    socket.username = session.username;
    initialize(socket);
  });
});
