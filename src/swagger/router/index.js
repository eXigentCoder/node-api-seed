'use strict';
var swagger = require('swagger-spec-express');
var express = require('express');
var buildMetadata = require('../build-metadata');
var addStandardRoutes = require('./add-standard-routes');
var config = require('nconf');
var _ = require('lodash');

module.exports = function Router(options) {
    options = buildMetadata(options);
    setTag(options);
    return createRouter(options);
};

function setTag(options) {
    if (options.tag === false) {
        return;
    }
    let defaultTag = {
        name: options.title,
        description: options.schemas.core.description
    };
    options.tag = options.tag || defaultTag;
    swagger.common.addTag(options.tag);
}

function createRouter(options) {
    var routerOptions = config.get('expressApp').routerOptions;
    var router = express.Router(routerOptions);
    swagger.swaggerize(router);
    router.metadata = options;
    addStandardRoutes(router);
    addCommonMiddleware(router);
    return router;
}

function addCommonMiddleware(router) {
    if (!_.isObject(router.metadata.schemas)) {
        throw new Error("Schemas must be an object when calling setSchemas");
    }
    router.use(commonMiddleware);

    function commonMiddleware(req, res, next) {
        if (!req.process) {
            req.process = {};
        }
        req.process.metadata = req.process.metadata || router.metadata;
        req.process.query = req.process.query || {};
        next();
    }
}