"use strict";

var error = require('debug')('error');
var express = require('express');
var router = express.Router();
var Sandbox = require('sandbox');

router.get('/', function (req, res) {
  // FIXME: Parse from somewhere else
  var frontendRoot = '//localhost:8080';
  res.render('index', {frontendRoot: frontendRoot});
});

router.post('/login', function (req, res) {
  // TODO: check if login information is valid
  var valid = true;
  if (valid) {
    req.session.username = req.body.username;
  }
  res.redirect('/');
})
.get('/login', function (req, res) {
  if (req.session.username === undefined) {
    res.json({ login: false });
  } else {
    res.json({ login: true });
  }
});

router.post('/logout', function (req, res) {
// FIXME: CSRF
  req.session.destroy(function (err) {
    if (err) {
      error(err);
      return;
    }
    res.redirect('/');
  });
});

router.post('/test', function (req, res) {
  var sandbox = new Sandbox();
  sandbox.run(req.body.code, res.json.bind(res));
});

module.exports = router;
