'use strict';

var TurnLength = 15; // in seconds

function Timer(handler) {
  this.handler = handler;
  this.handle = null;
}

Timer.prototype.fire = function () {
  if (this.handle !== null) {
    this.clear();
  }

  setTimeout(this.handler.bind(this), 0); // call handler at first
  this.handle = setInterval(this.handler.bind(this), TurnLength * 1000);
};

Timer.prototype.clear = function () {
  if (this.handle !== null) {
    clearInterval(this.handle);
    this.handle = null;
  }
};

module.exports = Timer;
