'use strict';
var passport = require("passport");
var passportJWT = require("passport-jwt");
var mongo = require('../mongo');
var boom = require('boom');
var util = require('util');
var config = require('nconf');
var jwt = require('jsonwebtoken');
var moment = require('moment');
var _ = require('lodash');

module.exports = {
    initialise: initialise,
    buildJwtPayload: buildJwtPayload,
    sign: sign,
    getUserToken: getUserToken
};

function initialise(app, callback) {
    var strategy = new passportJWT.Strategy(_.omit(config.get('authenticationOptions').jwt, 'sign'), findUserById);
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
        callback(null, user);
    }
}

function buildJwtPayload(user) {
    return {
        id: user._id
    };
}

function sign(payload) {
    var jwtOptions = config.get('authenticationOptions').jwt;
    return jwt.sign(payload, jwtOptions.secretOrKey, jwtOptions.sign);
}

function getUserToken(user) {
    return sign(buildJwtPayload(user));
}