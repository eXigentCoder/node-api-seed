'use strict';
var express = require('express');
var router = express.Router();
var boom = require('boom');
var rateLimit = require('../../rate-limit');
var mongo = require('../../mongo');
var bcrypt = require('bcrypt');
var authentication = require('../../authentication');
module.exports = router;


router.post("/login", [
    rateLimit.loginIp,
    rateLimit.loginUsername,
    findUser,
    comparePassword
]);

function findUser(req, res, next) {
    var query = {email: req.body.username};
    mongo.db.collection('users').findOne(query, dataRetrieved);
    function dataRetrieved(err, user) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return next(boom.unauthorized());
        }
        req.process.user = user;
        next();
    }
}

function comparePassword(req, res, next) {
    var user = req.process.user;
    bcrypt.compare(req.body.password, user.passwordHash, passwordCompareComplete);
    function passwordCompareComplete(err, matches) {
        if (err) {
            return next(err);
        }
        if (!matches) {
            return next(boom.unauthorized());
        }

        var token = authentication.getUserToken(user);
        res.send(token);
    }
}