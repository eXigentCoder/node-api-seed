'use strict';
var async = require('async');
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var config = require('nconf');

module.exports = function initialise(callback) {
    async.waterfall([
        createApp
        //more async steps coming here soon
    ], callback);
};

function createApp(callback) {
    var app = express();
    app.use(cors(config.get('corsOptions'))); //todo If you need CORS to only be enabled for certain origins or routes, please configure these in config. See https://www.npmjs.com/package/cors for info.
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));
    //morganOptions.initialise();
    //app.use(morgan(morganOptions.format, morganOptions.morganOptions));
    //app.use(routes);
    //app.use(error.notFoundMiddleware);
    //app.use(error.errorHandlerMiddleware);
    callback(null, app);
}