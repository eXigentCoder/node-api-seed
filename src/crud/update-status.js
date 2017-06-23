const output = require('../output');
const applyMaps = require('./shared/apply-maps');
const getValidateFunction = require('./shared/get-validate-function');
const versionInfo = require('../version-info');
const schemaName = 'updateStatus';
const _ = require('lodash');
const config = require('nconf');
const validator = require('../validate/validator');
const boom = require('boom');
const util = require('util');
const permissions = require('../permissions');
const assert = require('assert');

module.exports = {
    addUpdateStatusRoute,
    getSteps,
    description,
    ensureStatusAllowed,
    validate,
    schemaName
};

function addUpdateStatusRoute(router, crudMiddleware, maps) {
    ensureRouterValid(router);
    addIndividualStatusSchemas(router);
    addDefaultStatusSchemaIfApplicable(router);
    router
        .put('/:' + router.metadata.identifierName + '/:newStatusName', getSteps(router, crudMiddleware, maps))
        .describe(router.metadata.updateStatusDescription || description(router.metadata));
    return router;
}

function addIndividualStatusSchemas(router) {
    router.metadata.schemas.core.statuses.forEach(function(status) {
        if (status.schema) {
            const coreSchemaId = router.metadata.schemas.core.$id;
            setStatusSchemaId(status, coreSchemaId);
        }
    });
}

function setStatusSchemaId(status, coreSchemaId) {
    status.schema.$id = coreSchemaId.replace('.json', `-${schemaName}-${_.kebabCase(status.name)}.json`);
}

function addDefaultStatusSchemaIfApplicable(router) {
    if (router.metadata.schemas.updateStatus) {
        return validator.addSchema(router.metadata.schemas.updateStatus);
    }
    if (router.metadata.schemas.core.updateStatusSchema) {
        router.metadata.schemas.updateStatus = _.cloneDeep(router.metadata.schemas.core.updateStatusSchema);
        const coreSchemaId = router.metadata.schemas.core.$id;
        router.metadata.schemas.updateStatus.$id = coreSchemaId.replace('.json', `-${schemaName}.json`);
        return validator.addSchema(router.metadata.schemas.updateStatus);
    }
    const numberOfStatusesWithASchema = router.metadata.schemas.core.statuses.filter(status => status.schema).length;
    if (numberOfStatusesWithASchema !== router.metadata.schemas.core.statuses.length) {
        throw new Error('No update status schema set or not every status has a schema.');
    }
}

function ensureRouterValid(router) {
    assert(router.metadata.schemas.core.statuses, 'No statuses defined in metadata.schemas.core.statuses');
    assert(_.isArray(router.metadata.schemas.core.statuses), 'metadata.schemas.core.statuses must be an array');
    assert(
        router.metadata.schemas.core.statuses.length > 0,
        'metadata.schemas.core.statuses array must have at least one item in it.'
    );
    router.metadata.schemas.core.statuses.forEach(function(status) {
        assert(_.isObject(status), 'items in metadata.schemas.core.statuses array must be an object.');
        assert(
            status.name,
            'items in metadata.schemas.core.statuses array must be an object which must have a property called "name"'
        );
        assert(
            _.isString(status.name),
            'items in metadata.schemas.core.statuses array must be an object which must have a property called "name" which must be a string'
        );
    });
}

function getSteps(router, crudMiddleware, maps) {
    const steps = {
        ensureStatusAllowed: ensureStatusAllowed(router.metadata),
        validate: validate(),
        getExistingMetadata: crudMiddleware.getExistingMetadata,
        checkPermissions: permissions.checkRoleAndOwner(
            router.metadata.namePlural,
            'updateStatus',
            router.metadata.schemas.core.ownership
        ),
        updateVersionInfo: versionInfo.update,
        updateStatus: crudMiddleware.updateStatus,
        writeHistoryItem: crudMiddleware.writeHistoryItem,
        sendOutput: output.sendNoContent
    };
    return applyMaps(maps, steps);
}

function description(metadata) {
    const correlationIdOptions = config.get('logging').correlationId;
    return {
        security: true,
        summary:
            'Updates the status of ' +
                metadata.aOrAn +
                ' ' +
                metadata.title +
                ' By ' +
                _.startCase(metadata.identifierName),
        tags: [metadata.tag.name],
        parameters: [
            {
                name: metadata.identifierName,
                description: 'The field to uniquely identify this ' + metadata.title.toLowerCase(),
                required: true,
                in: 'path',
                type: 'string'
            },
            {
                name: 'statusData',
                description: 'Any data you would like to store, associated with the status update.',
                required: false,
                in: 'body',
                schema: _.omit(metadata.schemas.updateStatus, 'id')
            },
            {
                name: 'newStatusName',
                description: 'The new status to set for this ' + metadata.title.toLowerCase(),
                required: true,
                in: 'path',
                type: 'string'
            }
        ],
        common: {
            responses: ['500', '400', '401', '404', '403'],
            parameters: {
                header: [correlationIdOptions.reqHeader]
            }
        },
        responses: {
            '204': {
                description: 'Lets the calling system know that the request was successful',
                commonHeaders: [correlationIdOptions.resHeader]
            }
        }
    };
}

function ensureStatusAllowed(metadata) {
    return function _ensureStatusAllowed(req, res, next) {
        const statusNames = metadata.schemas.core.statuses.map(status => status.name);
        let foundStatus = metadata.schemas.core.statuses.find(
            status => status.name.toLowerCase() === req.params.newStatusName.toLowerCase()
        );
        if (!foundStatus) {
            return next(
                boom.badRequest(
                    util.format(
                        'Invalid status name : "%s", should have been one of the following: %j',
                        req.params.newStatusName,
                        statusNames
                    )
                )
            );
        }
        req.params.newStatusName = foundStatus.name;
        req.process.newStatus = foundStatus;
        return next();
    };
}

function validate() {
    const defaultValidationFunction = getValidateFunction(schemaName);
    return function(req, res, next) {
        if (req.process.newStatus.schema) {
            const result = validator.validate(req.process.newStatus.schema.$id, req.body);
            if (!result.valid) {
                return next(boom.badRequest(result.message, result.errors));
            }
            return next();
        }
        defaultValidationFunction(req, res, next);
    };
}
