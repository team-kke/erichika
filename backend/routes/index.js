"use strict";

var express = require('express');
var router = express.Router();

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

module.exports = router;
