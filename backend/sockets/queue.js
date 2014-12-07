"use strict";

var error = require('debug')('error');
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
  this.confirmed = {};
}

Team.prototype.push = function (username) {
  verbose('Team.push(%s)', username);
  var socket = user[username].socket;
  this.room.push(socket);
  this.members.push(username);
  user[username].team = this;
  this.confirmed[username] = false;
};

Team.prototype.move = function (src, dest) {
  verbose('Team.move(%s, %s)', src, dest);
  var index = src.indexOf(this);
  if (index > -1) {
    src.splice(index, 1);
    verbose('Team.move(%s, %s), remove team from src', src, dest);
    if (dest) {
      verbose('Team.move(%s, %s), push team to dest', src, dest);
      dest.push(this);
    }
  } else {
    verbose('Team.move(%s, %s), src does not contain this team.', src, dest);
  }
};

Team.prototype.removeUser = function (username) {
  verbose('Team.removeUser(%s)', username);
  var index = this.members.indexOf(username);
  if (index > -1) {
    this.members.splice(index, 1);
    this.room.remove(user[username].socket);
    user[username].team = null;
    delete this.confirmed[username];
  }
};

function updateClient(team, state) {
  if (!team instanceof Team || typeof state !== 'string') {
    error('updateClient, check arguments');
    return;
  }

  var current;
  if (state === 'wait-player') {
    current = team.members.length;
  } else if (state === 'wait-confirm') {
    current = Object.keys(team.confirmed)
      .map(function (k) {
        return team.confirmed[k];
      }).filter(function (v) {
        return v;
      }).length;
  } else {
    error('queue/update, abnormal state(%s)', state);
    return;
  }

  verbose('emit queue/update, state: %s, current: %s', state, current);
  team.room.emit('queue/update', {
    state: state,
    current: current
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
  var username = this.socket.username;
  verbose('queue/exit, username: %s', username);
  if (user[username]) {
    var team = user[username].team;
    if (team) {
      var isWaitingPlayer = teams.waitPlayer.indexOf(team) > -1;
      var isWaitingConfirm = teams.waitConfirm.indexOf(team) > -1;
      if (isWaitingPlayer || isWaitingConfirm) {
        team.removeUser(username);
        if (isWaitingConfirm) {
          team.move(teams.waitConfirm, teams.waitPlayer);
          updateClient(team, 'wait-player');
        }
      } else {
        error('queue/exit, abnormal state');
      }
    }
  }
}

function confirm() {
  var username = this.socket.username;
  verbose('queue/confirm, username: %s', username);
  if (user[username]) {
    var team = user[username].team;
    if (teams.waitConfirm.indexOf(team) < 0) {
      error('queue/confirm, abnormal state');
      return;
    }

    team.confirmed[username] = true;
    updateClient(team, 'wait-confirm');
    // from now, client knows this confirm makes game start or not.

    var everyoneConfirmed = true;
    for (var u in team.confirmed) {
      verbose('user: %s, confirmed: %s', u, team.confirmed[u]);
      if (!team.confirmed[u]) {
        verbose('queue/confirm, not everyone confirmed yet');
        everyoneConfirmed = false;
        break;
      }
    }

    if (everyoneConfirmed) {
      verbose('queue/confirm, everyone confirmed! start a game');
      team.move(teams.waitConfirm, null);
      // TODO: start game!
    }
  }
}

function disconnect() {
  var username = this.socket.username;
  verbose('disconnect. %s', username);

  var index = queue.indexOf(username);
  if (index > -1) {
    queue.splice(index, 1);
  }

  if (user[username]) {
    var team = user[username].team;
    if (team) {
      var isWaitingPlayer = teams.waitPlayer.indexOf(team) > -1;
      var isWaitingConfirm = teams.waitConfirm.indexOf(team) > -1;
      if (isWaitingPlayer || isWaitingConfirm) {
        team.removeUser(username);
        updateClient(team, 'wait-player');
        if (isWaitingConfirm) {
          verbose('user disconnected was in the team waiting confirm.. this team goes waiting players again ');
          team.move(teams.waitConfirm, teams.waitPlayer);
        }
      }
    }
  }
}

module.exports = generate({
  'queue/join': { name: 'join', function: join },
  'queue/exit': { name: 'exit', function: exit },
  'queue/confirm': { name: 'confirm', function: confirm },
  'queue/dodge': { name: 'dodge', function: exit },
  'disconnect': { name: 'disconnect', function: disconnect }
});
