'use strict';
const mongo = require('../mongo');
const MongoStore = require('express-brute-mongo');
const ExpressBrute = require('express-brute');
const config = require('nconf');
const instances = {};
const moment = require('moment');
const util = require('util');
const boom = require('boom');
const async = require('async');
const _ = require('lodash');

module.exports = {
    initialise: function (app, callback) {
        async.parallel([
            initialise('api'),
            initialise('loginUsername'),
            initialise('loginIp')
        ], function (err) {
            return callback(err, app);
        });
    },
    api: function (req, res, next) {
        return instances.api.prevent(req, res, next);
    },
    loginUsername: function (req, res, next) {
        instances.loginUsername.getMiddleware({
            key: getUsername,
            failCallback: loginRateLimited,
            ignoreIP: true
        })(req, res, next);
    },
    loginIp: function (req, res, next) {
        instances.loginIp.prevent(req, res, next);
    }
};

function getUsername(req, res, next) {
    next(req.body.username);
}

function apiRateLimited(req, res, next, nextValidRequestDate) {
    const message = util.format("You've made too many requests. Next allowed request %s (%s)", moment(nextValidRequestDate).fromNow(), nextValidRequestDate.toISOString());
    return next(boom.tooManyRequests(message));
}

function loginRateLimited(req, res, next, nextValidRequestDate) {
    return next(new Error(util.format("Not implemented. %s", nextValidRequestDate.toISOString()))); //todo need to look up how many types the rate limit has been reached and freeze the account untill a two-factor auth call is made.
}

function initialise(instanceName) {
    return function (callback) {
        const store = new MongoStore(function (storeReady) {
            storeReady(mongo.db.collection('rate-limit-' + instanceName));
            callback();
        });
        const rateLimits = config.get('expressApp').rateLimits;
        const defaultRateLimits = rateLimits.default;
        const options = _.merge(defaultRateLimits, rateLimits[instanceName]);
        options.failCallback = options.failCallback || apiRateLimited;
        instances[instanceName] = new ExpressBrute(store, options);
    };
}