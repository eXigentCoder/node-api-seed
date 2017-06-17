const express = require('express');
const router = express.Router();
const boom = require('boom');
const rateLimit = require('../../rate-limit');
const mongo = require('../../mongo');
const bcrypt = require('bcrypt');
const authentication = require('../../authentication');
module.exports = router;

router.post('/login', [rateLimit.loginIp, rateLimit.loginUsername, findUser, comparePassword]);

function findUser(req, res, next) {
    const query = { email: req.body.username };
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
    const user = req.process.user;
    bcrypt.compare(req.body.password, user.passwordHash, passwordCompareComplete);
    function passwordCompareComplete(err, matches) {
        if (err) {
            return next(err);
        }
        if (!matches) {
            return next(boom.unauthorized());
        }

        const token = authentication.getUserToken(user);
        res.send(token);
    }
}
