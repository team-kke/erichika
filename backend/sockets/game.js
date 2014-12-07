"use strict";

function startGame(context) {
  context.team.room.emit('game/join');
}

module.exports.start = startGame;
