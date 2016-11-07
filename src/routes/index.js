'use strict';
var express = require('express');
var config = require('nconf');
var expressOptions = config.get('expressApp');
var router = express.Router(expressOptions.routerOptions);
var base = require('./base');
var authentication = require('./authentication');
var users = require('./users');
var rateLimit = require('../rate-limit');
var passport = require("passport");
module.exports = router;

router.use('/', base);
router.use('/authentication', authentication);
router.use(rateLimit.api);
router.use(passport.authenticate('jwt', {session: false}));
router.use('/users', users);

