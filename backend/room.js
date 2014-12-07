"use strict";

var Room = function (name) {
  this.name = name;
  this.sockets = [];
};

Room.prototype.push = function (socket) {
  if (this.sockets.indexOf(socket) < 0) {
    this.sockets.push(socket);
  }
};

Room.prototype.remove = function (socket) {
  var idx = this.sockets.indexOf(socket);
  if (idx < 0) {
    return false;
  }
  this.sockets.splice(idx, 1);
  return true;
};

Room.prototype.join = function (socket) {
  this.push(socket);
  this.emit(this.name + '/join', {username: socket.username});
  socket.on('disconnect', function () {
    this.leave(socket);
  }.bind(this));
};

Room.prototype.leave = function (socket) {
  if (this.remove(socket)) {
    this.emit(this.name + '/leave', {username: socket.username});
  }
};

Room.prototype.emit = function (eventName, data, handler) {
  this.sockets.forEach(function (socket) {
    if (handler !== undefined) {
      handler(socket, data);
    }
    socket.emit(eventName, data);
  });
};

var RoomSet = function () {
  this.rooms = {};
};

RoomSet.prototype.get = function (name) {
  var room = this.rooms[name];
  if (!room) {
    room = new Room(name);
    this.rooms[name] = room;
    return room;
  } else {
    return room;
  }
};

module.exports = new RoomSet();
module.exports.Room = Room;
