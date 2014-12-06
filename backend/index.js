"use strict";

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var debug = require('debug')('server');
var express = require('express');
var path = require('path');
var redis = require('redis');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);

var routes = require('./routes/index');
var socket = require('./socket');

var app = express();

var sessionSecret = 'kashikoi kawaii erichika';
var sessionStore = new RedisStore({client: redis.createClient()});
app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: true,
  store: sessionStore
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/', routes);

app.set('view engine', 'jade');
app.set('views', path.join(__dirname, 'views'));

var server = app.listen(process.env.PORT || 3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  debug('listening at http://%s:%s', host, port);
});

socket.attach(server);
socket.setSessionParser(function (socket, callback) {
  cookieParser(sessionSecret)(socket.handshake, {}, function () {
    var sid = socket.handshake.signedCookies['connect.sid'];
    sessionStore.get(sid, callback);
  });
});
