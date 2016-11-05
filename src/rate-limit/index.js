'use strict';
var mongo = require('../mongo');
var MongoStore = require('express-brute-mongo');
var ExpressBrute = require('express-brute');
var config = require('nconf');
var expressOptions = config.get('expressApp');
var apiBruteForce;
var moment = require('moment');
var util = require('util');
var boom = require('boom');

module.exports = {
    initialise: function (app, callback) {
        var store = new MongoStore(function (storeReady) {
            storeReady(mongo.db.collection('bruteforce-store'));
            callback(null, app);
        });
        var options = expressOptions.apiRateLimitOptions;
        options.failCallback = options.failCallback || failCallback;
        apiBruteForce = new ExpressBrute(store, options);
    },
    api: function (req, res, next) {
        return apiBruteForce.prevent(req, res, next);
    }
};
function failCallback(req, res, next, nextValidRequestDate) {
    var message = util.format("You've made too many requests. Next allowed request %s (%s)", moment(nextValidRequestDate).fromNow(), nextValidRequestDate.toISOString());
    return next(boom.tooManyRequests(message));
}
