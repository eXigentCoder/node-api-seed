'use strict';
var output = require('../output');
var applyMaps = require('./shared/apply-maps');
var ensureSchemaSet = require('./../metadata/ensure-schema-set');
var getValidateFunction = require('./shared/get-validate-function');
var addModel = require('../swagger/add-model');
var _ = require('lodash');
var schemaName = 'update';
var versionInfo = require('../version-info');
var config = require('nconf');
var roles = require('../roles');

module.exports = function addUpdateRoute(router, crudMiddleware, maps) {
    ensureSchemaSet(router.metadata, schemaName, 'Input');
    router.put('/:' + router.metadata.identifierName, getSteps(router, crudMiddleware, maps))
        .describe(router.metadata.updateDescription || description(router.metadata));
    return router;
};

function getSteps(router, crudMiddleware, maps) {
    var steps = {
        checkRole: roles.checkRole(router.metadata.namePlural, 'update', router.metadata),
        validate: getValidateFunction(schemaName),
        getExistingMetadata: crudMiddleware.getExistingMetadata,
        updateVersionInfo: versionInfo.update,
        update: crudMiddleware.update,
        writeHistoryItem: crudMiddleware.writeHistoryItem,
        sendOutput: output.sendNoContent
    };
    return applyMaps(maps, steps);
}

function description(metadata) {
    addModel(metadata.schemas.output);
    var correlationIdOptions = config.get('logging').correlationId;
    return {
        security: true,
        summary: "Updates " + metadata.aOrAn + " " + metadata.title + " By " + _.startCase(metadata.identifierName),
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
            "204": {
                description: "Shows that the update request was successfully carried out",
                commonHeaders: [correlationIdOptions.resHeader]
            }
        }
    };
}
