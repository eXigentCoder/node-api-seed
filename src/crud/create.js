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
    router.post('/', getSteps(router, options))
        .describe(router.metadata.descriptions.post);
}

function getSteps(router, options) {
    var steps = {
        validate: validate,
        create: options.crudMiddleware.create,
        filterOutput: outputMap.filterOutput,
        sendCreateResult: options.crudMiddleware.sendCreateResult
    };
    return applyMaps(options.maps, steps);
}

function validate(req, res, next) {
    if (!req.process.schemas) {
        return next(new Error("req.process.schemas must be set"));
    }
    if (!req.process.schemas.creation) {
        return next(new Error("req.process.schemas.creation must be set"));
    }
    if (!req.process.schemas.creation.id) {
        return next(new Error(util.format("req.process.schemas.creation.id was null. Schema was %j ", req.process.schemas.creation)));
    }
    var result = validator.validate(req.process.schemas.creation.id, req.body);
    if (!result.valid) {
        return next(boom.badRequest(result.message, result.errors));
    }
    return next();
}

