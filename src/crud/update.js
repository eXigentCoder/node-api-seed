'use strict';
var outputMap = require('../output-map');
var applyMaps = require('../swagger/router/step-maps');
var ensureSchemaSet = require('./../swagger/build-metadata/ensure-schema-set');
var getValidateFunction = require('./@shared/get-validate-function');
var addModel = require('../swagger/build-metadata/add-model');
var _ = require('lodash');
var schemaName = 'update';
var versionInfo = require('../version-info');

module.exports = {
    addRoute: addRoute
};

function addRoute(router, options) {
    ensureSchemaSet(router.metadata, schemaName, 'Input');
    router.put('/:' + router.metadata.identifierName, getSteps(router, options))
        .describe(router.metadata.updateDescription || description(router.metadata));
}

function getSteps(router, options) {
    var steps = {
        validate: getValidateFunction(schemaName),
        getExistingVersionInfo: options.crudMiddleware.getExistingVersionInfo,
        updateVersionInfo: versionInfo.update,
        update: options.crudMiddleware.update,
        sendOutput: outputMap.sendNoContent
    };
    return applyMaps(options.maps, steps);
}

function description(metadata) {
    addModel(metadata.schemas.output);
    return {
        security: true,
        summary: "Updates a " + metadata.title + " By " + _.startCase(metadata.identifierName),
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
            "204": {
                description: "Shows that the update request was successfully carried out",
                commonHeaders: ["X-Request-Id"]
            }
        }
    };
}