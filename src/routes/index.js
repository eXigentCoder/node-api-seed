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
var boom = require('boom');
module.exports = router;

router.use('/', base);
router.use('/authentication', authentication);
router.use(rateLimit.api);
router.use(authenticate);
router.use('/users', users);

function authenticate(req, res, next) {
    passport.authenticate('jwt', {session: false}, authenticationCallback)(req, res);
    function authenticationCallback(err, user) {
        if (err) {
            return next(err);
        }
        if (user) {
            return next();
        }
        return next(boom.unauthorized());
    }
}