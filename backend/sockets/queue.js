"use strict";

var error = require('debug')('error');

function join() {
}

function exit() {
}

function confirm() {
}

function dodge() {
}

function Route(socket) {
  this.socket = socket;
}

Route.prototype.join = join;
Route.prototype.exit = exit;
Route.prototype.confirm = confirm;
Route.prototype.dodge = dodge;

module.exports = function (socket) {
  var route = new Route(socket);
  socket.on('lobby/join', route.join.bind(route));
  socket.on('lobby/exit', route.exit.bind(route));
  socket.on('lobby/confirm', route.confirm.bind(route));
  socket.on('lobby/dodge', route.dodge.bind(route));
};
