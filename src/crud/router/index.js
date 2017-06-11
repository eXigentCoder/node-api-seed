'use strict';
const swagger = require('swagger-spec-express');
const express = require('express');
const buildMetadata = require('../../metadata');
const config = require('nconf');
const _ = require('lodash');

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
    const routerOptions = config.get('expressApp').routerOptions;
    const router = new express.Router(routerOptions);
    swagger.swaggerize(router);
    router.metadata = options;
    addCommonMiddleware(router);
    return router;
}

function addCommonMiddleware(router) {
    if (!_.isObject(router.metadata.schemas)) {
        throw new Error('Schemas must be an object when calling setSchemas');
    }
    router.use(commonMiddleware);

    function commonMiddleware(req, res, next) {
        if (!req.process) {
            req.process = {};
        }
        req.process.metadata = router.metadata;
        req.process.query = req.process.query || {};
        next();
    }
}
