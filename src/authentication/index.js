'use strict';
var passport = require("passport");
var passportJWT = require("passport-jwt");
var mongo = require('../mongo');
var boom = require('boom');
var util = require('util');
var config = require('nconf');
var jwt = require('jsonwebtoken');

module.exports = {
    initialise: initialise,
    buildJwtPayload: buildJwtPayload,
    sign: sign,
    getUserToken: getUserToken
};

function initialise(app, callback) {
    var strategy = new passportJWT.Strategy(config.get('authenticationOptions').jwt, findUserById);
    passport.use(strategy);
    callback(null, app);
}

function findUserById(req, payload, callback) {
    var parsedId;
    try {
        parsedId = mongo.parseId(payload.id);
    }
    catch (err) {
        return callback(err);
    }
    var query = {_id: parsedId};
    mongo.db.collection('users').findOne(query, dataRetrieved);

    function dataRetrieved(err, user) {
        if (err) {
            return callback(err);
        }
        if (!user) {
            return callback(boom.notFound(util.format('A user with the _id field of "%s" was not found.', parsedId)));
        }
        req.process.currentUser = user;
        callback(null, user);
    }
}

function buildJwtPayload(user) {
    return {id: user._id}; // todo authorisation?
}

function sign(payload) {
    return jwt.sign(payload, config.get('authenticationOptions').jwt.secretOrKey);
}

function getUserToken(user) {
    return sign(buildJwtPayload(user));
}