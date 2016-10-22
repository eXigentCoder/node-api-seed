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
var path = require('path');
var appSettings = config.get('expressApp');
var outputMap = require('./output-map');

module.exports = function initialise(callback) {
    async.waterfall([
        createApp,
        initialiseSwagger,
        addRoutes,
        addCommonSwaggerItems,
        generateSwaggerJson
    ], callback);
};

function createApp(callback) {
    var app = express();
    app.set('json spaces', appSettings.jsonSpaces);
    app.set('x-powered-by', appSettings.xPoweredBy);
    app.use(cors(config.get('corsOptions')));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));
    app.use('/apidocs', express.static(path.join(__dirname, '../public')));
    configureRequestId(app);
    configureMorgan(app);
    app.use(outputMap.init);
    callback(null, app);
}

function addRoutes(app, callback) {
    app.use(routes);
    app.use(error.notFound);
    app.use(error.errorHandler);
    app.use(error.boomErrorHandler);
    return callback(null, app);
}

