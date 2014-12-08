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
  this.turn = 0;
  this.joined = {};

  function Timer(game) {
    this.game = game;
    this.handle = null;
  }

  Timer.prototype.fire = function () {
    if (this.handle !== null) {
      this.clear();
    }
    this.handle = setInterval(this.tick, 1000);
  };
  Timer.prototype.tick = function () {
    this.game.turn++;
  };

  Timer.prototype.clear = function () {
    if (this.handle !== null) {
      clearInterval(this.handle);
      this.handle = null;
    }
  };

  this.timer = new Timer(this);
}

Game.prototype.sockets = function () {
  return this.room.sockets;
};

Game.prototype.inTeam = function (num, who) {
  return this.team[num].users.filter(function (user) {
    return user.username === who.username;
  }).length > 0;
};

Game.prototype.ours = function (whose) {
  var team;
  if (this.inTeam(0, whose)) {
    team = this.team[0];
  } else if (this.inTeam(1, whose)) {
    team = this.team[1];
  } else {
    error('Game.ours(), no team available for user %s', whose.username);
    return null;
  }

  team.users.forEach(function (user) {
    // TODO: check 'current' true
    user.me = user.username === whose.username;
  });

  return team;
};

Game.prototype.opponents = function (whose) {
  var team;
  if (this.inTeam(1, whose)) {
    team = this.team[0];
  } else if (this.inTeam(0, whose)) {
    team = this.team[1];
  } else {
    error('Game.opponents(), no team available for user %s', whose.username);
    return null;
  }

  team.users.forEach(function (user) {
    // TODO: check 'current' true
    user.me = false;
  });

  return team;
};

Game.prototype.socket = function (whose) {
  return this.sockets().filter(function (socket) {
    return socket.username === whose.username;
  })[0];
};

Game.prototype.broadcast = function (from, eventName, data, postProcess,
                                     exceptForMe) {
  var that = this;
  var handlerFactory = function (side) {
    return function (user) {
      data.side = side;

      if (postProcess) {
        postProcess(user, data);
      }

      if (!exceptForMe || user.username !== from.username) {
        that.socket(user).emit(eventName, data);
      }
    };
  };

  this.ours(from).users.forEach(handlerFactory('ours'));
  this.opponents(from).users.forEach(handlerFactory('opponents'));
};

Game.prototype.userJoined = function (socket) {
  verbose('user(%s) didJoin', socket.username);
  this.joined[socket.username] = true;
};

Game.prototype.isEveryoneJoined = function () {
  return Object.keys(this.joined).length === this.sockets().length;
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
    game.sockets().forEach(update);
  }
}

function didJoin() {
  verbose('game/didJoin');
  var game = games[this.socket.gid];
  game.userJoined(this.socket);
  updateClient(game, this.socket);
  if (game.isEveryoneJoined()) {
    verbose('everyone joined! emit game/problem');
    game.room.emit('game/problem', {
      title: 'Largest prime factor',
      description: 'What is the largest prime factor of the number 600851475143?'
    });
  }
}

function chat(data) {
  verbose('game/chat');
  var game = games[this.socket.gid];
  game.broadcast(this.socket, 'game/chat', {
    chat: {
      username: this.socket.username,
      text: data.text
    }
  }, function (receiver, data) {
    data.chat.me = receiver.username === data.chat.username;
  });
}

function code(data) {
  verbose('game/code');
  var game = games[this.socket.gid];
  game.broadcast(this.socket, 'game/code', {code: data.code}, null, true);
}

module.exports = generate({
  'game/didJoin': { name: 'didJoin', function: didJoin },
  'game/chat': { name: 'chat', function: chat },
  'game/code': { name: 'code', function: code }
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
