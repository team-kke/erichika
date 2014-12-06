"use strict";

var io = require('./libs/socket.io');

var Socket = function () {
  this.io = null;
};

Socket.prototype.connect = function () {
  this.io = io();
};

Socket.prototype.on = function (eventName, handler) {
  this.io.on(eventName, handler);
};

module.exports = Socket;
