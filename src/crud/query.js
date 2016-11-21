'use strict';
var output = require('../output');
var applyMaps = require('./shared/apply-maps');
var addModel = require('../swagger/add-model');
var config = require('nconf');
var roles = require('../roles');

module.exports = function addQueryRoute(router, crudMiddleware, maps) {
    router.get('/', getSteps(router, crudMiddleware, maps))
        .describe(router.metadata.queryDescription || description(router.metadata));
    return router;
};

function getSteps(router, crudMiddleware, maps) {
    var steps = {
        checkRole: roles.checkRole(router.metadata.namePlural, 'query', router.metadata),
        query: crudMiddleware.query,
        setOutput: output.setFrom(router.metadata.namePlural),
        ensureOutput: output.ensureExists({default: []}),
        filterOutput: output.filter,
        sendOutput: output.send
    };
    return applyMaps(maps, steps);
}

function description(metadata) {
    addModel(metadata.schemas.output);
    var correlationIdOptions = config.get('logging').correlationId;
    return {
        security: true,
        summary: "Search for " + metadata.titlePlural,
        tags: [metadata.tag.name],
        common: {
            responses: ["500", "400", "401"],
            parameters: {
                header: [correlationIdOptions.reqHeader],
                query: ["select", "skip", "limit", "sort", "rawQuery"]
            }
        },
        responses: {
            200: {
                description: 'Returns the list of ' + metadata.titlePlural + ' matching the supplied parameters.',
                arrayOfModel: metadata.schemas.output.name,
                commonHeaders: [correlationIdOptions.resHeader]
            }
        }
    };
}