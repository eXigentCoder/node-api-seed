'use strict';
const express = require('express');
const config = require('nconf');
const expressOptions = config.get('expressApp');
const router = express.Router(expressOptions.routerOptions);
const base = require('./base');
const authentication = require('./authentication');
const users = require('./users');
const rateLimit = require('../rate-limit');
const passport = require('passport');
const boom = require('boom');
module.exports = router;

router.use('/', base);
router.use('/authentication', authentication);
router.use(rateLimit.api);
router.use(authenticate);
router.use('/users', users);

function authenticate(req, res, next) {
    passport.authenticate('jwt', { session: false }, authenticationCallback)(req, res);
    function authenticationCallback(err, user) {
        if (err) {
            return next(err);
        }
        if (user) {
            req.user = user;
            return next();
        }
        return next(boom.unauthorized());
    }
}
