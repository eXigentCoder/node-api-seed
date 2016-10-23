'use strict';
var outputMap = require('../output-map');
var applyMaps = require('../swagger/router/step-maps');
var addModel = require('../swagger/build-metadata/add-model');
module.exports = {
    addRoute: addRoute
};

function addRoute(router, options) {
    router.get('/', getSteps(router, options))
        .describe(router.metadata.queryDescription || description(router.metadata));
}

function getSteps(router, options) {
    var steps = {
        addQueryStringToQuery: outputMap.addQueryStringToQuery,
        query: options.crudMiddleware.query,
        setOutput: outputMap.setOutput(router.metadata.namePlural),
        ensureOutput: outputMap.ensureOutput({default: []}),
        filterOutput: outputMap.filterOutput,
        sendOutput: outputMap.sendOutput
    };
    return applyMaps(options.maps, steps);
}

function description(metadata) {
    addModel(metadata.schemas.output);
    return {
        security: true,
        summary: "Search for " + metadata.titlePlural,
        tags: [metadata.tag.name],
        common: {
            responses: ["500", "400", "401"],
            parameters: {
                header: ["X-Request-Id"],
                query: ["select", "skip", "limit", "sort", "rawQuery"]
            }
        },
        responses: {
            200: {
                description: 'Returns the list of ' + metadata.titlePlural + ' matching the supplied parameters.',
                arrayOfModel: metadata.schemas.output.name,
                commonHeaders: ["X-Request-Id"]
            }
        }
    };
}