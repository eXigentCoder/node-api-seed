'use strict';
const output = require('../output');
const applyMaps = require('./shared/apply-maps');
const addModel = require('../swagger/add-model');
const config = require('nconf');
const permissions = require('../permissions');

module.exports = function addQueryRoute(router, crudMiddleware, maps) {
    router
        .get('/', getSteps(router, crudMiddleware, maps))
        .describe(router.metadata.queryDescription || description(router.metadata));
    return router;
};

function getSteps(router, crudMiddleware, maps) {
    const steps = {
        checkPermissions: permissions.checkRoleAndOwnerToSetQuery(
            router.metadata.namePlural,
            'query',
            router.metadata.schemas.core.ownership
        ),
        query: crudMiddleware.query,
        setOutput: output.setFrom(router.metadata.namePlural),
        ensureOutput: output.ensureExists({ default: [] }),
        filterOutput: output.filter,
        sendOutput: output.send
    };
    return applyMaps(maps, steps);
}

function description(metadata) {
    addModel(metadata.schemas.output);
    const correlationIdOptions = config.get('logging').correlationId;
    return {
        security: true,
        summary: 'Search for ' + metadata.titlePlural,
        tags: [metadata.tag.name],
        common: {
            responses: ['500', '400', '401', '403'],
            parameters: {
                header: [correlationIdOptions.reqHeader],
                query: ['select', 'skip', 'limit', 'sort', 'rawQuery']
            }
        },
        responses: {
            200: {
                description: 'Returns the list of ' +
                    metadata.titlePlural +
                    ' matching the supplied parameters.',
                arrayOfModel: metadata.schemas.output.name,
                commonHeaders: [correlationIdOptions.resHeader]
            }
        }
    };
}
