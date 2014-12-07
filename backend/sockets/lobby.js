"use strict";

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

var join = updateUserList;
var leave = updateUserList;

function Route(socket) {
  this.socket = socket;
}

Route.prototype.connect = connect;
Route.prototype.chat = chat;
Route.prototype.join = join;
Route.prototype.leave = leave;

module.exports = function (socket) {
  var route = new Route(socket);
  socket.on('lobby/connect', route.connect.bind(route));
  socket.on('lobby/join', route.join.bind(route));
  socket.on('lobby/leave', route.leave.bind(route));
  socket.on('lobby/chat', route.chat.bind(route));
};
