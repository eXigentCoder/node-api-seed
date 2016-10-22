'use strict';
var express = require('express');
var router = express.Router();
var base = require('./base');
module.exports = router;

router.use('/', base);

