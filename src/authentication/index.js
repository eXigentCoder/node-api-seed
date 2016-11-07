'use strict';
var _ = require("lodash");
var jwt = require('jsonwebtoken');
var passport = require("passport");
var passportJWT = require("passport-jwt");
var ExtractJwt = passportJWT.ExtractJwt;
var JwtStrategy = passportJWT.Strategy;
var mongo = require('../mongo');
var boom = require('boom');
var util = require('util');

var jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeader(),
    secretOrKey: 'tasmanianDevil'
};

module.exports = {
    initialise: initialise,
    login: login
};

function initialise(app, callback) {
    var strategy = new JwtStrategy(jwtOptions, findUserById);
    passport.use(strategy);
    callback(null, app);
}

function findUserById(payload, callback) {
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

function login(username, password, callback) {
    // todo db call will happen here
    var user = users[_.findIndex(users, {name: username})];
    if (!user) {
        return callback();
    }
    if (user.password === password) {
        var payload = {id: user.id};
        var token = jwt.sign(payload, jwtOptions.secretOrKey);
        return callback(null, token);
    }
    return callback();
}