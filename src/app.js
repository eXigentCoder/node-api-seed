'use strict';
var async = require('async');
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var config = require('nconf');
var routes = require('./routes');
var configureMorgan = require('./logging/configure-morgan');
var configureRequestId = require('./logging/configure-request-id');

module.exports = function initialise(callback) {
    async.waterfall([
        createApp
        //more async steps coming here soon
    ], callback);
};

function createApp(callback) {
    var app = express();
    app.use(cors(config.get('corsOptions')));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));
    configureRequestId(app);
    configureMorgan(app);
    app.use(routes);
    //app.use(error.notFoundMiddleware);
    //app.use(error.errorHandlerMiddleware);
    callback(null, app);
}