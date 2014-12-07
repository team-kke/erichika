"use strict";

var error = require('debug')('error');
var generate = require('./base');
var verbose = require('debug')('verbose:game');

var games = {};
var incrementId = 0;

function Game(id, users, room) {
  verbose('Game() constructor called with users: [%s]', users.map(function (user) {
    return user.username;
  }));

  // TODO:validate users.length

  this.id = id;

  this.team = [
    { users: users.splice(0, 3) },
    { users: users }
  ];
  this.room = room;
}

Game.prototype.all = function () {
  return this.team[0].users.concat(this.team[1].users);
};

Game.prototype.inTeam = function (num, socket) {
  return this.team[num].users.filter(function (user) {
    return user.username === socket.username;
  }).length > 0;
};

Game.prototype.ours = function (socket) {
  var team;
  if (this.inTeam(0, socket)) {
    team = this.team[0];
  } else if (this.inTeam(1, socket)) {
    team = this.team[1];
  } else {
    return null;
  }

  team.users.forEach(function (user) {
    // TODO: check 'current' true
    user.me = user.username === socket.username;
  });

  return team;
};

Game.prototype.opponents = function (socket) {
  var team;
  if (this.inTeam(1, socket)) {
    team = this.team[0];
  } else if (this.inTeam(0, socket)) {
    team = this.team[1];
  } else {
    return null;
  }

  team.users.forEach(function (user) {
    // TODO: check 'current' true
    user.me = false;
  });

  return team;
};

Game.prototype.broadcast = function (from, eventName, data) {
  var handlerFactory = function (side) {
    return function (socket) {
      // Clone data
      data.side = side;
      socket.emit(eventName, data);
    };
  };

  this.ours(from).users.forEach(handlerFactory('ours'));
  this.opponents(from).users.forEach(handlerFactory('opponents'));
};

function updateClient(game, socket) {
  if (!game instanceof Game) {
    error('game.js, updateClient, check arguments');
  }

  verbose('game/update');

  var update = function (target) {
    target.emit('game/update', {
      ours: game.ours(target),
      opponents: game.opponents(target)
    });
  };

  if (socket) {
    update(socket);
  } else {
    game.all().forEach(update);
  }
}

function didJoin() {
  verbose('game/didJoin');
  updateClient(games[this.socket.gid], this.socket);
}

module.exports = generate({
  'game/didJoin': { name: 'didJoin', function: didJoin }
});

function startGame(context) {
  var game = new Game(incrementId, context.team.members.map(function (username) {
    return {
      username: username,
      me: false,
      current: false
    };
  }), context.team.room);

  verbose('a new game is made. id = %s', incrementId);

  game.room.emit('game/join', null, function (socket) {
    socket.gid = incrementId;
  });

  games[incrementId++] = game;
}

module.exports.start = startGame;
