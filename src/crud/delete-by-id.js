'use strict';
const output = require('../output');
const applyMaps = require('./shared/apply-maps');
const _ = require('lodash');
const addModel = require('../swagger/add-model');
const config = require('nconf');
const permissions = require('../permissions');

module.exports = function addDeleteByIdRoute(router, crudMiddleware, maps) {
    router
        .delete('/:' + router.metadata.identifierName, getSteps(router, crudMiddleware, maps))
        .describe(router.metadata.getByIdDescription || description(router.metadata));
    return router;
};

function getSteps(router, crudMiddleware, maps) {
    const steps = {
        checkPermissions: permissions.checkRoleOnly(router.metadata.namePlural, 'deleteById'),
        findByIdentifier: crudMiddleware.findByIdentifier,
        deleteByIdentifier: crudMiddleware.deleteByIdentifier,
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
        summary: 'Removes ' +
            metadata.aOrAn +
            ' ' +
            metadata.title +
            ' By ' +
            _.startCase(metadata.identifierName) +
            '.',
        tags: [metadata.tag.name],
        parameters: [
            {
                name: metadata.identifierName,
                description: 'The field to uniquely identify this ' +
                    metadata.title.toLowerCase() +
                    '.',
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
                description: 'Shows that the delete request was successfully carried out',
                commonHeaders: [correlationIdOptions.resHeader]
            }
        }
    };
}
