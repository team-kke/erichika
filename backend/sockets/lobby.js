"use strict";

var generate = require('./base');

var lobby = require('../room').get('lobby');

function connect() {
  lobby.join(this.socket);
}

function chat(data) {
  lobby.emit('lobby/chat', {
    username: this.socket.username,
    text: data.text
  }, function (receiver, dataToSend) {
    dataToSend.me = receiver.username === this.socket.username;
  }.bind(this));
}

function updateUserList() {
  var userList = lobby.sockets.map(function (userSocket) {
    return {
      username: userSocket.username,
      me: userSocket.username === this.socket.username
    };
  }.bind(this));
  this.socket.emit('lobby/userList', {userList: userList});
}

module.exports = generate({
  'lobby/connect': { name: 'connect', function: connect },
  'lobby/join': { name: 'join', function: updateUserList },
  'lobby/leave': { name: 'leave', function: updateUserList },
  'lobby/chat': { name: 'chat', function: chat }
});
