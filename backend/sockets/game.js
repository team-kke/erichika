"use strict";

var error = require('debug')('error');
var generate = require('./base');
var verbose = require('debug')('verbose:game');

function Game(id, users, room) {
  verbose('Game() constructor called with users: [%s]', users.map(function (user) {
    return user.username;
  }));

  // TODO:validate users.length

  this.id = id;
  this.ours = { users: users.splice(0, 3)};
  this.opponents = { users: users };
  this.room = room;
}

var games = {};
var count = 0;

function updateClient(game, socket) {
  if (!game instanceof Game) {
    error('game.js, updateClient, check arguments');
  }

  verbose('game/update');

  function postProcess(socket, data) {
    // TODO: check 'current' true
    var swap = false;
    data.ours.users.forEach(function (user) {
      user.me = user.username === socket.username;
    });
    data.opponents.users.forEach(function (user) {
      user.me = user.username === socket.username;
      swap = user.me || swap;
    });

    if (swap) {
      var t = data.ours;
      data.ours = data.opponents;
      data.opponents = t;
    }
  }

  var data = {
    ours: game.ours,
    opponents: game.opponents
  };

  if (socket) {
    postProcess(socket, data);
    socket.emit('game/update', data);
  } else {
    game.room.emit('game/update', data, postProcess);
  }

}

function startGame(context) {
  var game = new Game(count, context.team.members.map(function (username) {
    return {
      username: username,
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
  updateClient(games[this.socket.gid], this.socket);
}

module.exports = generate({
  'game/didJoin': { name: 'didJoin', function: didJoin }
});

module.exports.start = startGame;
