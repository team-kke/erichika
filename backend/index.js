"use strict";

var debug = require('debug')('server');
var express = require('express');

var routes = require('./routes/index');

var app = express();

app.use('/', routes);

var server = app.listen(process.env.PORT || 3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  debug('listening at http://%s:%s', host, port);
});
