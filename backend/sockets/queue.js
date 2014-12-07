"use strict";

var generate = require('./base');

function join() {
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
