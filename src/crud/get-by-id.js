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
    router.get('/:' + router.metadata.identifierName, getSteps(router, options))
        .describe(router.metadata.descriptions.getById);
}

function getSteps(router, options) {
    var steps = {
        findByIdentifier: options.crudMiddleware.findByIdentifier,
        setOutput: outputMap.setOutput(router.metadata.name),
        ensureOutput: outputMap.ensureOutput({metadata: router.metadata}),
        filterOutput: outputMap.filterOutput,
        sendOutput: outputMap.sendOutput
    };
    return applyMaps(options.maps, steps);
}

function validate(req, res, next) {
    return next();
}