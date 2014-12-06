"use strict";

var debug = require('debug')('server');
var express = require('express');
var io = require('socket.io')();
var path = require('path');
var redis = require('redis');
var session = require('express-session');
var sessionStore = require('connect-redis')(session);

var routes = require('./routes/index');

var app = express();
var redisClient = redis.createClient();

app.use(session({
  secret: 'kashikoi kawaii erichika',
  resave: false, // don't save session if unmodified
  saveUninitialized: false, // don't create session until something stored
  store: new sessionStore({ host: 'localhost', port: 6379, client: redisClient })
}));

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
