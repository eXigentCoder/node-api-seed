'use strict';
var outputMap = require('../output-map');
var applyMaps = require('../swagger/router/step-maps');
var ensureSchemaSet = require('./../swagger/build-metadata/ensure-schema-set');
var getValidateFunction = require('./@shared/get-validate-function');
var addModel = require('../swagger/build-metadata/add-model');
var schemaName = 'creation';

module.exports = {
    addRoute: addRoute
};

function addRoute(router, options) {
    ensureSchemaSet(router.metadata, schemaName, 'Input');
    router.post('/', getSteps(router, options))
        .describe(router.metadata.creationDescription || description(router.metadata));
}

function getSteps(router, options) {
    var steps = {
        validate: getValidateFunction(schemaName),
        create: options.crudMiddleware.create,
        filterOutput: outputMap.filterOutput,
        sendCreateResult: options.crudMiddleware.sendCreateResult
    };
    return applyMaps(options.maps, steps);
}

function description(metadata) {
    addModel(metadata.schemas.output);
    addModel(metadata.schemas[schemaName]);
    return {
        security: true,
        summary: "Posts Through " + metadata.aOrAn + " " + metadata.title + " To Be Created.",
        tags: [metadata.tag.name],
        common: {
            responses: ["500", "400", "401"],
            parameters: {
                header: ["X-Request-Id"]
            }
        },
        parameters: [
            {
                name: metadata.name,
                description: "The " + metadata.title.toLowerCase() + " to be created.",
                required: true,
                in: "body",
                model: metadata.schemas[schemaName].name
            }
        ],
        responses: {
            "201": {
                description: 'Informs the caller that the ' + metadata.title.toLowerCase() + ' was successfully created.',
                commonHeaders: ["X-Request-Id"],
                model: metadata.schemas.output.name
            }
        }
    };
}