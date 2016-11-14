'use strict';
var output = require('../output');
var applyMaps = require('./step-maps');
var _ = require('lodash');
var addModel = require('../swagger/build-metadata/add-model');
var config = require('nconf');

module.exports = {
    addRoute: addRoute
};

function addRoute(router, options) {
    router.get('/:' + router.metadata.identifierName, getSteps(router, options))
        .describe(router.metadata.getByIdDescription || description(router.metadata));
}

function getSteps(router, options) {
    var steps = {
        findByIdentifier: options.crudMiddleware.findByIdentifier,
        setOutput: output.setFrom(router.metadata.name),
        ensureOutput: output.ensureExists({metadata: router.metadata}),
        filterOutput: output.filter,
        sendOutput: output.send
    };
    return applyMaps(options.maps, steps);
}

function description(metadata) {
    addModel(metadata.schemas.output);
    var correlationIdOptions = config.get('logging').correlationId;
    return {
        security: true,
        summary: "Get " + metadata.title + " By " + _.startCase(metadata.identifierName) + ".",
        tags: [metadata.tag.name],
        parameters: [
            {
                name: metadata.identifierName.toLowerCase(),
                description: "The field to uniquely identify this " + metadata.title.toLowerCase() + ".",
                required: true,
                in: "path",
                type: "string"
            }
        ],
        common: {
            responses: ["500", "400", "401", "404"],
            parameters: {
                header: [correlationIdOptions.reqHeader]
            }
        },
        responses: {
            "200": {
                description: "Returns the single " + metadata.title + " matching the provided parameters.",
                model: metadata.schemas.output.name,
                commonHeaders: [correlationIdOptions.resHeader]
            }
        }
    };
}