"use strict";

var debug = require('debug')('server');
var express = require('express');
var io = require('socket.io')();
var path = require('path');

var routes = require('./routes/index');

var app = express();

app.use('/', routes);

app.set('view engine', 'jade');
app.set('views', path.join(__dirname, 'views'));

var server = app.listen(process.env.PORT || 3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  debug('listening at http://%s:%s', host, port);
});

io.attach(server);

// TODO: move these lines to separated file.
io.on('connection', function (socket) {
  debug('+1 socket connection');
  io.emit('test', { message: 'Hey, everyone! +1 connection' });
  socket.on('test', function (data) {
    debug('received: %s', data);
  });
  socket.on('disconnect', function () {
    debug('-1 socket connection');
  });
});
