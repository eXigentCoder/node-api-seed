'use strict';
const output = require('../output');
const applyMaps = require('./shared/apply-maps');
const ensureSchemaSet = require('../metadata/ensure-schema-set');
const filterPropertiesForCreation = require('../metadata/filter-properties-for-creation');
const getValidateFunction = require('./shared/get-validate-function');
const addModel = require('../swagger/add-model');
const versionInfo = require('../version-info');
const schemaName = 'creation';
const config = require('nconf');
const moment = require('moment');
const permissions = require('../permissions');
const boom = require('boom');
const util = require('util');
const _ = require('lodash');

function addCreateRoute(router, crudMiddleware, maps) {
    ensureSchemaSet(router.metadata, schemaName, 'Input');
    filterPropertiesForCreation(router.metadata.schemas[schemaName]);
    router
        .post('/', getSteps(router, crudMiddleware, maps))
        .describe(router.metadata.creationDescription || description(router.metadata));
    return router;
}
addCreateRoute.setStatusIfApplicable = setStatusIfApplicable;
addCreateRoute.setOwnerIfApplicable = setOwnerIfApplicable;
module.exports = addCreateRoute;

function getSteps(router, crudMiddleware, maps) {
    const steps = {
        validate: getValidateFunction(schemaName),
        addVersionInfo: versionInfo.add,
        setStatusIfApplicable: setStatusIfApplicable(router.metadata),
        setOwnerIfApplicable: setOwnerIfApplicable(router.metadata),
        checkPermissions: permissions.checkRoleAndOwner(
            router.metadata.namePlural,
            'create',
            router.metadata.schemas.core.ownership
        ),
        create: crudMiddleware.create,
        filterOutput: output.filter,
        sendCreateResult: sendCreateResult(router.metadata)
    };
    return applyMaps(maps, steps);
}

function sendCreateResult(metadata) {
    return function(req, res) {
        let fullUrl;
        const id = req.process.output[metadata.identifierName];
        if (metadata.createdItemLocationHeader) {
            fullUrl = metadata.createdItemLocationHeader;
        } else {
            fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
        }
        fullUrl += '/' + id;
        return res.status(201).location(fullUrl).json(req.process.output);
    };
}

function description(metadata) {
    addModel(metadata.schemas.output);
    addModel(metadata.schemas[schemaName]);
    const correlationIdOptions = config.get('logging').correlationId;
    return {
        security: true,
        summary: 'Posts Through ' + metadata.aOrAn + ' ' + metadata.title + ' To Be Created.',
        tags: [metadata.tag.name],
        common: {
            responses: ['500', '400', '401', '403'],
            parameters: {
                header: [correlationIdOptions.reqHeader]
            }
        },
        parameters: [
            {
                name: metadata.name,
                description: 'The ' + metadata.title.toLowerCase() + ' to be created.',
                required: true,
                in: 'body',
                model: metadata.schemas[schemaName].name
            }
        ],
        responses: {
            '201': {
                description:
                    'Informs the caller that the ' +
                        metadata.title.toLowerCase() +
                        ' was successfully created.',
                commonHeaders: [correlationIdOptions.resHeader],
                model: metadata.schemas.output.name
            }
        }
    };
}

function setStatusIfApplicable(metadata) {
    return function _setStatusIfApplicable(req, res, next) {
        let statuses = metadata.schemas.core.statuses;
        if (!statuses || statuses.length <= 0) {
            return next();
        }
        req.body.status = statuses[0].name;
        req.body.statusDate = moment.utc().toDate();
        req.body.statusLog = [
            {
                status: req.body.status,
                data: {
                    reason: 'Initial Status' //todo need to set this logically somehow
                },
                statusDate: req.body.statusDate
            }
        ];
        return next();
    };
}

function setOwnerIfApplicable(metadata) {
    return function _setOwnerIfApplicable(req, res, next) {
        let ownership = metadata.schemas.core.ownership;
        if (!ownership || ownership.doNotTrack) {
            return next();
        }
        if (ownership.setOwnerExpression) {
            req.body.owner = _.get(req, ownership.setOwnerExpression);
            if (!req.body.owner) {
                return next(
                    boom.badRequest(
                        util.format(
                            'Owner from expression "%s" was blank',
                            ownership.setOwnerExpression
                        )
                    )
                );
            }
        } else {
            req.body.owner = req.user._id;
        }
        req.body.ownerDate = moment.utc().toDate();
        req.body.ownerLog = [
            {
                owner: req.body.owner,
                data: {
                    reason: 'Initial Owner' //todo from schema?
                },
                ownerDate: req.body.ownerDate
            }
        ];
        return next();
    };
}
