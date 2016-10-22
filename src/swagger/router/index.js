'use strict';
var swagger = require('swagger-spec-express');
var queryDescription = require('../descriptions/query');
var getByIdDescription = require('../descriptions/get-by-id');
var processingDescription = require('../descriptions/processing');
var postDescription = require('../descriptions/post');
var updateDescription = require('../descriptions/update');
var updateStatusDescription = require('../descriptions/update-status');
var express = require('express');
var buildMetadata = require('../build-metadata');
var addModels = require('./add-models');
var addStandardRoutes = require('./add-standard-routes');
var config = require('nconf');
var routerOptions = config.get('expressApp').routerOptions;

module.exports = function Router(options) {
    options = buildMetadata(options);
    setTag(options);
    addModels(options);
    setDescriptionMethods(options);
    setDescriptions(options);
    return createRouter(options);
};

function setDescriptionMethods(options) {
    options.queryDescription = options.queryDescription || queryDescription;
    options.getByIdDescription = options.getByIdDescription || getByIdDescription;
    options.processingDescription = options.processingDescription || processingDescription;
    options.postDescription = options.postDescription || postDescription;
    options.updateDescription = options.updateDescription || updateDescription;
    options.updateStatusDescription = options.updateStatus || updateStatusDescription;
}

function setDescriptions(options) {
    options.descriptions = options.descriptions || {};
    options.descriptions.query = options.descriptions.query || options.queryDescription(options);
    options.descriptions.getById = options.descriptions.getById || options.getByIdDescription(options);
    options.descriptions.processing = options.descriptions.processing || options.processingDescription(options);
    options.descriptions.post = options.descriptions.post || options.postDescription(options);
    options.descriptions.update = options.descriptions.update || options.updateDescription(options);
    options.descriptions.updateStatus = options.descriptions.updateStatus || options.updateStatusDescription(options);
}

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
    var router = express.Router(routerOptions);
    swagger.swaggerize(router);
    router.metadata = options;
    addStandardRoutes(router);
    return router;
}