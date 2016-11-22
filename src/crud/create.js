'use strict';
var output = require('../output');
var applyMaps = require('./shared/apply-maps');
var ensureSchemaSet = require('./../metadata/ensure-schema-set');
var getValidateFunction = require('./shared/get-validate-function');
var addModel = require('../swagger/add-model');
var versionInfo = require('../version-info');
var schemaName = 'creation';
var config = require('nconf');
var moment = require('moment');
var roles = require('../roles');
var boom = require('boom');
var util = require('util');

module.exports = function addCreateRoute(router, crudMiddleware, maps) {
    ensureSchemaSet(router.metadata, schemaName, 'Input');
    router.post('/', getSteps(router, crudMiddleware, maps))
        .describe(router.metadata.creationDescription || description(router.metadata));
    return router;
};

function getSteps(router, crudMiddleware, maps) {
    var steps = {
        checkPermissions: roles.checkPermissions(router.metadata.namePlural, 'create', router.metadata),
        validate: getValidateFunction(schemaName),
        addVersionInfo: versionInfo.add,
        setStatusIfApplicable: setStatusIfApplicable(router.metadata),
        setOwnerIfApplicable: setOwnerIfApplicable(router.metadata),
        create: crudMiddleware.create,
        filterOutput: output.filter,
        sendCreateResult: sendCreateResult(router.metadata)
    };
    return applyMaps(maps, steps);
}

function sendCreateResult(metadata) {
    return function (req, res) {
        var fullUrl;
        var id = req.process.output[metadata.identifierName];
        if (metadata.createdItemLocationHeader) {
            fullUrl = metadata.createdItemLocationHeader;
        } else {
            fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
        }
        fullUrl += '/' + id;
        return res.status(201)
            .location(fullUrl)
            .json(req.process.output);
    };
}

function description(metadata) {
    addModel(metadata.schemas.output);
    addModel(metadata.schemas[schemaName]);
    var correlationIdOptions = config.get('logging').correlationId;
    return {
        security: true,
        summary: "Posts Through " + metadata.aOrAn + " " + metadata.title + " To Be Created.",
        tags: [metadata.tag.name],
        common: {
            responses: ["500", "400", "401"],
            parameters: {
                header: [correlationIdOptions.reqHeader]
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
                commonHeaders: [correlationIdOptions.resHeader],
                model: metadata.schemas.output.name
            }
        }
    };
}

function setStatusIfApplicable(metadata) {
    return function _setStatusIfApplicable(req, res, next) {
        var statuses = metadata.schemas.core.statuses;
        if (!statuses || statuses.length <= 0) {
            return next();
        }
        req.body.status = statuses[0].name;
        req.body.statusDate = moment.utc().toDate();
        req.body.statusLog = [{
            status: req.body.status,
            data: null,
            statusDate: req.body.statusDate
        }];
        return next();
    };
}

function setOwnerIfApplicable(metadata) {
    return function _setOwnerIfApplicable(req, res, next) {
        var ownershipRules = metadata.schemas.core.ownership;
        if (!ownershipRules || ownershipRules.doNotTrack) {
            return next();
        }
        if (ownershipRules.field) {
            req.body.owner = req.body[ownershipRules.field];
            if (!req.body.owner) {
                return next(boom.badRequest(util.format('Owner field "%s" was blank', ownershipRules.field)));
            }
        } else {
            req.body.owner = req.user._id;
        }
        req.body.ownerDate = moment.utc().toDate();
        req.body.ownerLog = [{
            owner: req.body.owner,
            data: null,
            ownerDate: req.body.ownerDate
        }];
        return next();
    };
}