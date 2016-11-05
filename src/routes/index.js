'use strict';
var express = require('express');
var config = require('nconf');
var expressOptions = config.get('expressApp');
var router = express.Router(expressOptions.routerOptions);
var base = require('./base');
var users = require('./users');
var rateLimit = require('../rate-limit');
module.exports = router;

router.use('/', base);
router.use(rateLimit.api);
router.use('/users', users);

