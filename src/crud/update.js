'use strict';
const output = require('../output');
const applyMaps = require('./shared/apply-maps');
const ensureSchemaSet = require('../metadata/ensure-schema-set');
const filterPropertiesForUpdate = require('../metadata/filter-properties-for-update');
const getValidateFunction = require('./shared/get-validate-function');
const addModel = require('../swagger/add-model');
const _ = require('lodash');
const schemaName = 'update';
const versionInfo = require('../version-info');
const config = require('nconf');
const permissions = require('../permissions');

module.exports = {
    addUpdateRoute,
    getSteps,
    description
};

function addUpdateRoute(router, crudMiddleware, maps) {
    ensureSchemaSet(router.metadata, schemaName, 'Input');
    filterPropertiesForUpdate(router.metadata.schemas[schemaName]);
    const routeName = '/:' + router.metadata.identifierName;
    const routeAction = getSteps(router, crudMiddleware, maps);
    const routeDescription = router.metadata.updateDescription || description(router.metadata);

    router.put(routeName, routeAction).describe(_.cloneDeep(routeDescription));
    router.patch(routeName, routeAction).describe(_.cloneDeep(routeDescription));

    return router;
}

function getSteps(router, crudMiddleware, maps) {
    const steps = {
        validate: getValidateFunction(schemaName),
        getExistingMetadata: crudMiddleware.getExistingMetadata,
        checkPermissions: permissions.checkRoleAndOwner(
            router.metadata.namePlural,
            'update',
            router.metadata.schemas.core.ownership
        ),
        updateVersionInfo: versionInfo.update,
        update: crudMiddleware.update,
        writeHistoryItem: crudMiddleware.writeHistoryItem,
        sendOutput: output.sendNoContent
    };
    return applyMaps(maps, steps);
}

function description(metadata) {
    addModel(metadata.schemas.output);
    const correlationIdOptions = config.get('logging').correlationId;
    return {
        security: true,
        summary: 'Updates ' + metadata.aOrAn + ' ' + metadata.title + ' By ' + _.startCase(metadata.identifierName),
        tags: [metadata.tag.name],
        parameters: [
            {
                name: metadata.identifierName,
                description: 'The field to uniquely identify this ' + metadata.title.toLowerCase() + '.',
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
                description: 'Shows that the update request was successfully carried out',
                commonHeaders: [correlationIdOptions.resHeader]
            }
        }
    };
}
