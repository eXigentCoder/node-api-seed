'use strict';
var express = require('express');
var config = require('nconf');
var routerOptions = config.get('expressApp').routerOptions;
var router = express.Router(routerOptions);
var base = require('./base');
module.exports = router;

router.use('/', base);

