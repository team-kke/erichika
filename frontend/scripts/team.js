'use strict';

var Team = function (name) {
  this.name = name;
  this.code = '';
  this.users = [];
  this.chatLogs = [];
};

module.exports = Team;
