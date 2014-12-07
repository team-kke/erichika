"use strict";

var error = require('debug')('error');
var verbose = require('debug')('verbose:game');

function Game(id, users) {
  verbose('Game() constructor called with users: [%s]', users.map(function (user) {
    return user.name;
  }));

  this.id = id;
  this.users = users;
}

var games = {};
var count = 0;

function updateClient(game) {
  if (!game instanceof Game) {
    error('game.js, updateClient, check arguments');
  }

  verbose('game/update');

  game.room.emit('game/update', {
    users: game.members
  }, function (socket, data) {
    // TODO: check 'current' true
    data.me = socket.username === data.name;
  });
}

function startGame(context) {
  context.team.room.emit('game/join');

  var game = new Game(count, context.team.members.map(function (username) {
    return {
      name: username,
      me: false,
      current: false
    };
  }));

  verbose('a new game is made. id = %s', count);

  games[count++] = game;
  updateClient(game);
}

module.exports.start = startGame;