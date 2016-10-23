'use strict';
var outputMap = require('../output-map');
var applyMaps = require('../swagger/router/step-maps');
var _ = require('lodash');

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
        setOutput: outputMap.setOutput(router.metadata.name),
        ensureOutput: outputMap.ensureOutput({metadata: router.metadata}),
        filterOutput: outputMap.filterOutput,
        sendOutput: outputMap.sendOutput
    };
    return applyMaps(options.maps, steps);
}

function description(metadata) {
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
                header: ["X-Request-Id"]
            }
        },
        responses: {
            "200": {
                description: "Returns the single " + metadata.title + " matching the provided parameters.",
                model: metadata.schemas.output.name,
                commonHeaders: ["X-Request-Id"]
            }
        }
    };
}