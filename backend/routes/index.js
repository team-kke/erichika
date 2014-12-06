"use strict";

var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
  // FIXME: Parse from somewhere else
  var frontendRoot = '//localhost:8080';
  res.render('index', {frontendRoot: frontendRoot});
});

module.exports = router;
