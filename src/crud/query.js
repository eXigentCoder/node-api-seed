'use strict';
var util = require('util');
var boom = require('boom');
var validator = require('../validate/validator');
var outputMap = require('../output-map');
var applyMaps = require('../swagger/router/step-maps');

module.exports = {
    addRoute: addRoute,
    getSteps: getSteps,
    validate: validate
};

function addRoute(router, options) {
    router.get('/', getSteps(router, options))
        .describe(router.metadata.descriptions.query);
}

function getSteps(router, options) {
    var steps = {
        newQuery: outputMap.newQuery,
        addQueryStringToQuery: outputMap.addQueryStringToQuery,
        query: options.crudMiddleware.query,
        setOutput: outputMap.setOutput(router.metadata.namePlural),
        ensureOutput: outputMap.ensureOutput({default: []}),
        filterOutput: outputMap.filterOutput,
        sendOutput: outputMap.sendOutput
    };
    return applyMaps(options.maps, steps);
}

function validate(req, res, next) {
    return next();
}