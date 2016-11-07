'use strict';
var express = require('express');
var router = express.Router();
var authenticate = require('../../authentication/index');
var boom = require('boom');
var rateLimit = require('../../rate-limit');
module.exports = router;

router.post("/login", [
    rateLimit.loginIp,
    rateLimit.loginUsername,
    login
]);

function login(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    authenticate.login(username, password, authenticationComplete);

    function authenticationComplete(err, token) {
        if (err) {
            return next(err);
        }
        if (!token) {
            return next(boom.unauthorized());
        }
        req.brute.reset(function () {
            res.json({token: token});
        });
    }
}