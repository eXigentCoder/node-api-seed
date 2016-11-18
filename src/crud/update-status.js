'use strict';
var output = require('../output');
var applyMaps = require('./shared/apply-maps');
var getValidateFunction = require('./shared/get-validate-function');
var versionInfo = require('../version-info');
var schemaName = 'updateStatus';
var _ = require('lodash');
var config = require('nconf');
var validator = require('../validate/validator');
var boom = require('boom');
var util = require('util');

module.exports = function addUpdateStatusRoute(router, crudMiddleware, maps) {
    if (!router.metadata.schemas.core.statuses) {
        throw new Error("No statuses defined in metadata.schemas.core.statuses");
    }
    if (!_.isArray(router.metadata.schemas.core.statuses)) {
        throw new Error("metadata.schemas.core.statuses must be an array");
    }
    if (router.metadata.schemas.core.statuses.length <= 0) {
        throw new Error("metadata.schemas.core.statuses array must have at least one item in it.");
    }
    if (!router.metadata.schemas.updateStatus) {
        if (router.metadata.schemas.core.updateStatusSchema) {
            router.metadata.schemas.updateStatus = _.cloneDeep(router.metadata.schemas.core.updateStatusSchema);
            router.metadata.schemas.updateStatus.id = router.metadata.schemas.core.id.replace('.json', '-updateStatus.json');
        } else {
            throw new Error("No update status schema set.");
        }
    }
    validator.addSchema(router.metadata.schemas.updateStatus);
    router.put('/:' + router.metadata.identifierName + '/:newStatusName', getSteps(router, crudMiddleware, maps))
        .describe(router.metadata.updateStatusDescription || description(router.metadata));
    return router;
};

function getSteps(router, crudMiddleware, maps) {
    var steps = {
        validate: getValidateFunction(schemaName),
        ensureStatusAllowed: ensureStatusAllowed(router.metadata),
        getExistingMetadata: crudMiddleware.getExistingMetadata,
        updateVersionInfo: versionInfo.update,
        updateStatus: crudMiddleware.updateStatus,
        writeHistoryItem: crudMiddleware.writeHistoryItem,
        sendOutput: output.sendNoContent
    };
    return applyMaps(maps, steps);
}

function description(metadata) {
    var correlationIdOptions = config.get('logging').correlationId;
    return {
        security: true,
        summary: "Updates the status of " + metadata.aOrAn + " " + metadata.title + " By " + _.startCase(metadata.identifierName),
        tags: [metadata.tag.name],
        parameters: [
            {
                name: metadata.identifierName.toLowerCase(),
                description: "The field to uniquely identify this " + metadata.title.toLowerCase(),
                required: true,
                in: "path",
                type: "string"
            },
            {
                name: "statusData",
                description: "Any data you would like to store, associated with the status update.",
                required: false,
                in: "body",
                schema: _.omit(metadata.schemas.updateStatus, 'id')
            },
            {
                name: 'newStatusName',
                description: "The new status to set for this " + metadata.title.toLowerCase(),
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
                description: "Lets the calling system know that the request was successful",
                commonHeaders: [correlationIdOptions.resHeader]
            }
        }
    };
}

function ensureStatusAllowed(metadata) {
    return function _ensureStatusAllowed(req, res, next) {
        var statusNames = metadata.schemas.core.statuses.map(function (statusObj) {
            return statusObj.name;
        });
        var foundStatus = statusNames.some(function (statusName) {
            if (statusName.toLowerCase() === req.params.newStatusName.toLowerCase()) {
                req.params.newStatusName = statusName;
                return true;
            }
            return false;
        });
        if (!foundStatus) {
            return next(boom.badRequest(util.format('Invalid status name : "%s", should have been one of the following: %j', req.params.newStatusName, statusNames)));
        }
        return next();
    };
}