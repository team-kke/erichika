"use strict";

var error = require('debug')('error');
var generate = require('./base');
var problemSet = require('./problem-set');
var verbose = require('debug')('verbose:game');

var games = {};
var incrementId = 0;

// constants
var TurnLength = 15; // in seconds
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

  function Timer(game) {
    this.game = game;
    this.handle = null;
  }

  Timer.prototype.fire = function () {
    if (this.handle !== null) {
      this.clear();
    }
    this.handle = setInterval(this.tick.bind(this), 1000);
  };

  Timer.prototype.tick = function () {
    updateClient(this.game);
    this.game.turn++;
  };

  Timer.prototype.clear = function () {
    if (this.handle !== null) {
      clearInterval(this.handle);
      this.handle = null;
    }
  };

  this.timer = new Timer(this);
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
    user.current = this.timer.turn % team.users.length === index;
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
    user.current = this.timer.turn % team.users.length === index;
  }.bind(this));

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

function sendNotice(game, text) {
  game.sockets().forEach(function (socket) {
    socket.emit('game/chat', {
      side: 'ours',
      chat: { type: 'notice', text: text }
    });
  });
}

function startGame(game) {
  return function () {
    verbose('emit game/start!');
    game.room.emit('game/start');
    game.timer.fire();
  };
}

function didJoin() {
  verbose('game/didJoin');
  var game = games[this.socket.gid];
  game.userJoined(this.socket);
  updateClient(game, this.socket);
  if (game.isEveryoneJoined()) {
    verbose('everyone joined! emit game/problem');
    var problem = problemSet.getOne();
    game.room.emit('game/problem', problem);
    sendNotice(game, 'Game begins in ' + problem.preparationDuration + 's.');
    // wait 1 more second and start a game.
    setTimeout(startGame(game), 1000 * (problem.preparationDuration + 1));
  }
}

function chat(data) {
  verbose('game/chat');
  var game = games[this.socket.gid];
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
  game.broadcast(this.socket, 'game/code', {code: data.code}, null, true);
}

function submit(data) {
  verbose('game/submit');

  // FIXME: dummy code
  var game = games[this.socket.gid];
  game.ours(this.socket).users.forEach(function (user) {
    game.socket(user).emit('game/chat', {
      side: 'ours',
      chat: { type: 'notice', text: 'Wrong answer!' }
    });
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
