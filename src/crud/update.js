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
    router.put('/:' + router.metadata.identifierName, getSteps(router, options))
        .describe(router.metadata.descriptions.update);
}

function getSteps(router, options) {
    var steps = {
        validate: validate,
        update: options.crudMiddleware.update,
        sendOutput: outputMap.sendNoContent
    };
    return applyMaps(options.maps, steps);
}

function validate(req, res, next) {
    if (!req.process.schemas) {
        return next(new Error("req.process.schemas must be set"));
    }
    if (!req.process.schemas.update) {
        return next(new Error("req.process.schemas.update must be set"));
    }
    if (!req.process.schemas.update.id) {
        return next(new Error(util.format("req.process.schemas.update.id was null. Schema was %j ", req.process.schemas.update)));
    }
    var result = validator.validate(req.process.schemas.update.id, req.body);
    if (!result.valid) {
        return next(boom.badRequest(result.message, result.errors));
    }
    return next();
}