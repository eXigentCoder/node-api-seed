'use strict';
var output = require('../output');
var applyMaps = require('./shared/apply-maps');
var _ = require('lodash');
var addModel = require('../swagger/add-model');
var config = require('nconf');
var permissions = require('../permissions');

module.exports = function addGetByIdRoute(router, crudMiddleware, maps) {
    router.get('/:' + router.metadata.identifierName, getSteps(router, crudMiddleware, maps))
        .describe(router.metadata.getByIdDescription || description(router.metadata));
    return router;
};

function getSteps(router, crudMiddleware, maps) {
    var steps = {
        checkPermissions: permissions.checkRoleAndOwnerToSetQuery(router.metadata.namePlural, 'getById', router.metadata.schemas.core.ownership),
        findByIdentifier: crudMiddleware.findByIdentifier,
        setOutput: output.setFrom(router.metadata.name),
        ensureOutput: output.ensureExists({metadata: router.metadata}),
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
        summary: "Get " + metadata.title + " By " + _.startCase(metadata.identifierName) + ".",
        tags: [metadata.tag.name],
        parameters: [
            {
                name: metadata.identifierName,
                description: "The field to uniquely identify this " + metadata.title.toLowerCase() + ".",
                required: true,
                in: "path",
                type: "string"
            }
        ],
        common: {
            responses: ["500", "400", "401", "404", '403'],
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