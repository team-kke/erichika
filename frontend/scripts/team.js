'use strict';

var Team = function (side) {
  this.side = side;
  this.code = '';
  this.users = [];
  this.chatLogs = [];
};

module.exports = Team;
