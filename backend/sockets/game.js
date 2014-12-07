"use strict";

var error = require('debug')('error');
var generate = require('./base');
var verbose = require('debug')('verbose:game');

function Game(id, users, room) {
  verbose('Game() constructor called with users: [%s]', users.map(function (user) {
    return user.name;
  }));

  // TODO:validate users.length

  this.id = id;
  this.ours = users.splice(0, 3);
  this.opponents = users;
  this.room = room;
}

var games = {};
var count = 0;

function updateClient(game) {
  if (!game instanceof Game) {
    error('game.js, updateClient, check arguments');
  }

  verbose('game/update');

  game.room.emit('game/update', {
    ours: game.ours,
    opponents: game.opponents
  }, function (socket, data) {
    // TODO: check 'current' true
    data.ours.forEach(function (user) {
      user.me = user.name === socket.username;
    });
  });
}

function startGame(context) {

  var game = new Game(count, context.team.members.map(function (username) {
    return {
      name: username,
      me: false,
      current: false
    };
  }), context.team.room);

  verbose('a new game is made. id = %s', count);

  context.team.room.emit('game/join', null, function (socket) {
    socket.gid = count;
  });

  games[count++] = game;
}

function didJoin() {
  verbose('game/didJoin');
  updateClient(games[this.socket.gid]);
}

module.exports = generate({
  'game/didJoin': { name: 'didJoin', function: didJoin }
});
module.exports.start = startGame;
