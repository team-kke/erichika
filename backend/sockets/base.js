"use strict";

var debug = require('debug')('gen');

module.exports = function (obj) {
  debug('generate.. [%s]', Object.keys(obj));
  var e, key;
  var Route = function (socket) {
    this.socket = socket;
  };

  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      e = obj[key];
      Route.prototype[e.name] = e.function;
      debug('attach function %s at {module}.prototype.%s', e.function.name, e.name);
    }
  }

  return function (socket) {
    var route = new Route(socket);
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        e = obj[key];
        socket.on(key, route[e.name].bind(route));
        debug('register handler \'%s\'', key);
      }
    }
  };
};
