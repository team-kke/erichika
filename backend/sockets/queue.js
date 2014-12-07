"use strict";

var generate = require('./base');
var room = require('../room');
var verbose = require('debug')('verbose:queue');

var TEAMSIZE = 6;

var user = {};
var teams = { waitPlayer: [], waitConfirm: [] };
var queue = [];

function Team() {
  verbose('Team() constructor called');
  this.room = new room.Room();
  this.members = [];
}

Team.prototype.push = function (username) {
  verbose('Team.push(%s)', username);
  var socket = user[username].socket;
  this.room.push(socket);
  this.members.push(username);
};

Team.prototype.move = function (src, dest) {
  verbose('Team.move(%s, %s)', src, dest);
  var index = src.indexOf(this);
  if (index > -1) {
    src.splice(index, 1);
    if (dest) {
      dest.push(this);
    }
  }
};

function updateClient(team, state) {
  verbose('emit queue/update, state: %s, current: %s', state, team.members.length);
  team.room.emit('queue/update', {
    state: state,
    current: team.members.length
  });
}

function assignTeam() {
  verbose('assignTeam');
  if (queue.length && teams.waitPlayer.length === 0) {
    verbose('no team waiting player. make a new one.');
    teams.waitPlayer.push(new Team());
    verbose('teams.waitPlayer.length = %s', teams.waitPlayer.length);
  }

  for (var i = 0; i < teams.waitPlayer.length && queue.length; i++) {
    var team = teams.waitPlayer[i];
    var changed = false;
    while (team.members.length < TEAMSIZE && queue.length) {
      team.push(queue.shift());
      changed = true;
    }

    // if any changes, emit queue/update(wait-player) to every team member
    if (changed) {
      verbose('player(s) assigned. broadcast wait-player');
      updateClient(team, 'wait-player');
    }

    if (team.members.length === TEAMSIZE) {
      verbose('team is full(%s). move this team to wait-confirm list', TEAMSIZE);
      // add this team to wait-confirm list
      team.move(teams.waitPlayer, teams.waitConfirm);

      // emit wait-confirm to every team member.
      updateClient(team, 'wait-confirm');
    }
  }
}

function join() {
  verbose('queue/join, username: %s', this.socket.username);
  queue.push(this.socket.username);
  user[this.socket.username] = { socket: this.socket };
  assignTeam();
}

function exit() {
}

function confirm() {
}

function dodge() {
}

module.exports = generate({
  'queue/join': { name: 'join', function: join },
  'queue/exit': { name: 'exit', function: exit },
  'queue/confirm': { name: 'confirm', function: confirm },
  'queue/dodge': { name: 'dodge', function: dodge }
});
