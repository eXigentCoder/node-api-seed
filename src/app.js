'use strict';
var async = require('async');
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var config = require('nconf');
var routes = require('./routes');
var configureMorgan = require('./logging/configure-morgan');
var configureRequestId = require('./logging/configure-request-id');
var error = require('./error/index.js');
var initialiseSwagger = require('./swagger/initialise-swagger');
var addCommonSwaggerItems = require('./swagger/add-common-items');
var generateSwaggerJson = require('./swagger/generate-swagger-json');
var mongo = require('./mongo');
var helmet = require('helmet');
var rateLimit = require('./rate-limit');
var authentication = require('./authentication');
var permissions = require('./permissions');

module.exports = function initialise(callback) {
    async.waterfall([
        createApp,
        initialiseSwagger,
        addRoutes,
        addCommonSwaggerItems,
        generateSwaggerJson,
        mongo.connect,
        rateLimit.initialise,
        authentication.initialise,
        permissions.initialise
    ], callback);
};

function createApp(callback) {
    var appSettings = config.get('expressApp');
    var app = express();
    app.set('json spaces', appSettings.jsonSpaces);
    app.set('trust proxy', appSettings.trustProxy);
    app.use(helmet(appSettings.helmetOptions));
    app.use(cors(appSettings.corsOptions));
    app.use(bodyParser.json({
        type: ['json', 'application/csp-report']
    }));
    app.use(bodyParser.urlencoded({extended: true}));
    configureRequestId(app);
    configureMorgan(app);
    app.use(function (req, res, next) {
        req.process = {};
        next();
    });
    callback(null, app);
}

function addRoutes(app, callback) {
    app.use(routes);
    app.use(error.notFound);
    app.use(error.errorHandler);
    app.use(error.boomErrorHandler);
    return callback(null, app);
}

