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

Socket.prototype.emit = function (eventName, data) {
  this.io.emit(eventName, data);
};

Socket.prototype.propagate = function (eventName) {
  var that = this;
  this.on(eventName, function (data) {
    that.emit(eventName, data);
  });
};

module.exports = Socket;
