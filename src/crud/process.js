'use strict';
var boom = require('boom');
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
        process: notImplemented,
        sendProcessResult: notImplemented
    };
    return applyMaps(options.maps, steps);
}

function notImplemented(req, res, next) {
    return next(boom.notImplemented());
}

function description(metadata) {
    addModel(metadata.schemas[schemaName]);
    return {
        security: true,
        summary: "Posts Through " + metadata.aOrAn + " " + metadata.title + " To Be Processed.",
        tags: [metadata.title],
        common: {
            responses: ["500", "400", "401"],
            parameters: {
                header: ["X-Request-Id"]
            }
        },
        parameters: [
            {
                name: metadata.name,
                description: "The " + metadata.title.toLowerCase() + " to be processed.",
                required: true,
                in: "body",
                model: metadata.schemas[schemaName].name
            }
        ],
        responses: {
            "202": {
                description: 'Informs the caller that the ' + metadata.title.toLowerCase()
                + ' was successfully submitted to the server in order to be processed asynchronously.',
                commonHeaders: ["X-Request-Id"]
            }
        }
    };
}