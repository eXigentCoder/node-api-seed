'use strict';
var express = require('express');
var config = require('nconf');
var routerOptions = config.get('expressApp').routerOptions;
var router = express.Router(routerOptions);
var packageJson = require('../../package.json');
var testErrors = require('../routes/test-errors');
var path = require('path');
var boom = require('boom');
var swagger = require('swagger-spec-express');
swagger.swaggerise(router);
var appInfoSchema = require('./app-info.json');
swagger.common.addTag({
    name: "Info",
    description: "Info about the api"
});
swagger.common.addModel(appInfoSchema);

router.get('/', function (req, res) {
    var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    var appInfo = {
        appName: packageJson.name,
        version: packageJson.version,
        deploymentDate: packageJson.deploymentDate,
        environment: config.get('NODE_ENV'),
        uptime: process.uptime(),
        swaggerUiUrl: fullUrl + 'apidocs'
    };
    if (config.get('swagger').hideUi) {
        delete appInfo.swaggerUiUrl;
    }
    res.status(200).json(appInfo);
}).describe({
    security: false,
    summary: "Get API Details",
    tags: ["Info"],
    common: {
        responses: ["500"]
    },
    responses: {
        "200": {
            model: "appInfo",
            description: "Returns the information about the application",
            examples: {
                appName: "node-api-seed",
                version: "0.0.1",
                deploymentDate: "2016-10-22T14:48:26.240Z",
                environment: "development",
                uptime: "12.891",
                swaggerUiUrl: "http://localhost:10001/apidocs"
            }
        }
    }
});

router.use('/apidocs', function (req, res, next) {
    if (config.get('swagger').hideUi) {
        return next(boom.forbidden("Swagger ui is not allowed for this environment."));
    }
    return express.static(path.join(__dirname, '../../public'))(req, res, next);
});

router.post('/report-violation', function logCspViolation(req, res) {
    if (req.body) {
        console.error('CSP Violation from browser: ', req.body);
    } else {
        console.error('CSP Violation from browser: No data received!');
    }
    res.status(204).end();
});

router.get("/apidocs.json", function getApiDocument(req, res, next) {
    if (config.get('swagger').hideUi) {
        return next(boom.forbidden("Swagger ui is not allowed for this environment."));
    }
    return res.status(200).json(swagger.json());
}).describe({
    security: false,
    summary: "Get the swagger api JSON document",
    tags: ["Info"],
    externalDocs: {
        description: "The specification for the json document used to describe the api",
        url: "http://swagger.io/specification/"
    },
    common: {
        responses: ["500"]
    },
    responses: {
        "200": {
            description: "Returns the swagger specification for this api"
        }
    }
});

if (config.get('errorHandling').exposeErrorRoutes) {
    router.use('/error', testErrors);
}

module.exports = router;