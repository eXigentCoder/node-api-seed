'use strict';
var express = require('express');
var config = require('nconf');
var routerOptions = config.get('expressApp').routerOptions;
var router = express.Router(routerOptions);
var base = require('./base');
var users = require('./users');
module.exports = router;

router.use('/', base);
router.use('/users', users);

