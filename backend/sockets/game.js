"use strict";

var error = require('debug')('error');
var generate = require('./base');
var problemSet = require('./problem-set');
var GameTimer = require('./game-timer');
var verbose = require('debug')('verbose:game');

var games = {};
var incrementId = 0;

// constants
var TeamSize = 3;
var NumberOfTeam = 2;

// FIXME: due to circuler reference between updateClient and Game, Game is forward-declared.
var Game;

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

Game = function (id, users, room) {
  verbose('Game() constructor called with users: [%s]', users.map(function (user) {
    return user.username;
  }));

  if (users.length !== TeamSize * NumberOfTeam) {
    error('invaild users.length');
    return;
  }

  this.id = id;

  this.team = [
    { users: users.splice(0, 3) },
    { users: users }
  ];
  this.room = room;
  this.turn = 0;
  this.joined = {};
  this.started = false;
  this.problem = problemSet.getOne();

  this.timer = new GameTimer(function () {
    updateClient(this);
    this.turn++;
  }.bind(this));
};

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

  team.users.forEach(function (user, index) {
    user.me = user.username === whose.username;
    user.current = this.started && (this.turn % team.users.length === index);
  }.bind(this));

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

  team.users.forEach(function (user, index) {
    user.me = false;
    user.current = this.started && (this.turn % team.users.length === index);
  }.bind(this));

  return team;
};

Game.prototype.socket = function (whose) {
  return this.sockets().filter(function (socket) {
    return socket.username === whose.username;
  })[0];
};

Game.prototype.user = function (socket) {
  return this.team[0].users.concat(this.team[1].users).filter(function (user) {
    return user.username === socket.username;
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

Game.prototype.start = function () {
  verbose('emit game/start!');
  this.started = true;
  this.room.emit('game/start');
  this.timer.fire();
};

function sendNotice(game, text) {
  game.sockets().forEach(function (socket) {
    socket.emit('game/chat', {
      side: 'ours',
      chat: { type: 'notice', text: text }
    });
  });
}

function didJoin() {
  verbose('game/didJoin');
  var game = games[this.socket.gid];
  game.userJoined(this.socket);
  updateClient(game, this.socket);
  if (game.isEveryoneJoined()) {
    verbose('everyone joined! emit game/problem');
    game.room.emit('game/problem', game.problem);
    sendNotice(game, 'Game begins in ' + game.problem.preparationDuration + 's.');
    // wait 1 more second and start a game.
    setTimeout(game.start.bind(game), 1000 * (game.problem.preparationDuration + 1));
  }
}

function chat(data) {
  verbose('game/chat');
  var game = games[this.socket.gid];
  if (game.user(this.socket).current) {
    verbose('ignore game/chat from current user');
    return;
  }

  game.broadcast(this.socket, 'game/chat', {
    chat: {
      type: 'normal',
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
  if (!game.user(this.socket).current) {
    verbose('ignore game/code from non-current user');
    return;
  }
  game.broadcast(this.socket, 'game/code', {code: data.code}, null, true);
}

function submit(data) {
  verbose('game/submit');
  var game = games[this.socket.gid];
  if (!game.user(this.socket).current) {
    verbose('ignore game/submit from non-current user');
    return;
  }

  problemSet.validation(game.problem, data.code, function (valid) {
    if (valid) {
      game.ours(this.socket).users.forEach(function (user) {
        game.socket(user).emit('game/win');
      });
      game.opponents(this.socket).users.forEach(function (user) {
        game.socket(user).emit('game/lose');
      });
    } else {
      game.ours(this.socket).users.forEach(function (user) {
        game.socket(user).emit('game/chat', {
          side: 'ours',
          chat: { type: 'notice', text: 'Wrong answer!' }
        });
      });
    }
  });
}

module.exports = generate({
  'game/didJoin': { name: 'didJoin', function: didJoin },
  'game/chat': { name: 'chat', function: chat },
  'game/code': { name: 'code', function: code },
  'game/submit': { name: 'submit', function: submit }
});

function enterGame(context) {
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

module.exports.start = enterGame;
