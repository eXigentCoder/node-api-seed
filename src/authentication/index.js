const passport = require('passport');
const passportJWT = require('passport-jwt');
const mongo = require('../mongo');
const boom = require('boom');
const util = require('util');
const config = require('nconf');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

module.exports = {
    initialise: initialise,
    buildJwtPayload: buildJwtPayload,
    sign: sign,
    getUserToken: getUserToken
};

function initialise(app, callback) {
    const strategy = new passportJWT.Strategy(
        _.omit(config.get('authenticationOptions').jwt, 'sign'),
        findUserById
    );
    passport.use(strategy);
    callback(null, app);
}

function findUserById(req, payload, callback) {
    let parsedId;
    try {
        parsedId = mongo.parseId(payload.id);
    } catch (err) {
        return callback(err);
    }
    const query = { _id: parsedId };
    mongo.db.collection('users').findOne(query, dataRetrieved);

    function dataRetrieved(err, user) {
        if (err) {
            return callback(err);
        }
        if (!user) {
            return callback(
                boom.notFound(
                    util.format('A user with the _id field of "%s" was not found.', parsedId)
                )
            );
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
    const jwtOptions = config.get('authenticationOptions').jwt;
    return jwt.sign(payload, jwtOptions.secretOrKey, jwtOptions.sign);
}

function getUserToken(user) {
    return sign(buildJwtPayload(user));
}
