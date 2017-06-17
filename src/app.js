// @flow
import * as async from 'async';
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const config = require('nconf');
const routes = require('./routes');
const configureMorgan = require('./logging/configure-morgan');
const configureRequestId = require('./logging/configure-request-id');
const error = require('./error/index.js');
const initialiseSwagger = require('./swagger/initialise-swagger');
const addCommonSwaggerItems = require('./swagger/add-common-items');
const generateSwaggerJson = require('./swagger/generate-swagger-json');
const mongo = require('./mongo');
const helmet = require('helmet');
const rateLimit = require('./rate-limit');
const authentication = require('./authentication');
const permissions = require('./permissions');
const expressSanitized = require('express-sanitize-escape');

module.exports = function initialise(callback: Function) {
    async.waterfall(
        [
            createApp,
            initialiseSwagger,
            addRoutes,
            addCommonSwaggerItems,
            generateSwaggerJson,
            mongo.connect,
            rateLimit.initialise,
            authentication.initialise,
            permissions.initialise
        ],
        callback
    );
};

function createApp(callback) {
    const appSettings = config.get('expressApp');
    const app = express();
    app.set('json spaces', appSettings.jsonSpaces);
    app.set('trust proxy', appSettings.trustProxy);
    app.use(helmet(appSettings.helmetOptions));
    app.use(cors(appSettings.corsOptions));
    app.use(
        bodyParser.json({
            type: ['json', 'application/csp-report']
        })
    );
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(expressSanitized.middleware());
    configureRequestId(app);
    configureMorgan(app);
    app.use(function(req, res, next) {
        req.process = {};
        next();
    });
    console.log('App Created on ' + app.settings.env);
    callback(null, app);
}

function addRoutes(app, callback) {
    app.use(routes);
    app.use(error.notFound);
    app.use(error.errorHandler);
    app.use(error.boomErrorHandler);
    return callback(null, app);
}
