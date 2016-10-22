'use strict';
var _ = require('lodash');
var applyMaps = require('./apply-maps');
var outputMap = require('../../output-map');
var util = require('util');

module.exports = function addStandardRoutes(router) {
    if (!_.isObject(router.metadata)) {
        throw new Error("Router.metadata must be set!");
    }
    router.use(outputMap.setSchemas(router.metadata.schemas));
    router.add = {
        query: function (options) {
            queryRoute(router, options);
        },
        getById: function (options) {
            getByIdRoute(router, options);
        },
        create: function (options) {
            createRoute(router, options);
        },
        update: function (options) {
            updateRoute(router, options);
        },
        updateStatus: function (options) {
            updateStatusRoute(router, options);
        }
    };
    router.getByIdAndUse = function (path, routerOrMiddleware, options) {
        if (_.isObject(path) && _.isObject(routerOrMiddleware) && _.isNil(options)) {
            options = routerOrMiddleware;
            routerOrMiddleware = path;
            path = '/';
        }
        if (!_.isObject(routerOrMiddleware)) {
            throw new Error(util.format("routerOrMiddleware must be a router or middleware but was of type %s with a value of %j", typeof routerOrMiddleware, routerOrMiddleware));
        }
        if (!_.isObject(options)) {
            throw new Error(util.format("options must be an object but was of type %s with a value of %j", typeof options, options));
        }
        if (!_.isString(path)) {
            throw new Error(util.format("path must be a string but was of type %s with a value of %j", typeof path, path));
        }
        var steps = getByIdAndUseSteps(router, routerOrMiddleware, options);
        router.use('/:' + router.metadata.identifierName + path, steps);
    };
};

function queryRoute(router, options) {
    router.get('/', queryMiddleware(router, options))
        .describe(router.metadata.descriptions.query);
}

function getByIdRoute(router, options) {
    router.get('/:' + router.metadata.identifierName, getByIdSteps(router, options))
        .describe(router.metadata.descriptions.getById);
}

function createRoute(router, options) {
    router.post('/', createSteps(router, options))
        .describe(router.metadata.descriptions.post);
}

function updateRoute(router, options) {
    router.put('/:' + router.metadata.identifierName, updateSteps(router, options))
        .describe(router.metadata.descriptions.update);
}
function updateStatusRoute(router, options) {
    router.put('/:' + router.metadata.identifierName + '/:statusName', updateStatusSteps(router, options))
        .describe(router.metadata.descriptions.updateStatus);
}

function getByIdAndUseSteps(router, routerOrMiddleware, options) {
    var steps = {
        findByIdentifier: options.crudMiddleware.findByIdentifier,
        ensureExistsOnReq: outputMap.ensureExistsOnReq('process.' + router.metadata.name, {metadata: router.metadata})
    };
    if (_.isArray(routerOrMiddleware)) {
        routerOrMiddleware.forEach(function (item, index) {
            steps['routeOrMW' + (index + 1)] = item;
        });
    } else if (_.isFunction(routerOrMiddleware)) {
        steps.routeOrMW = routerOrMiddleware;
    }
    return applyMaps(options.maps, steps);
}

function queryMiddleware(router, options) {
    var steps = {
        newQuery: outputMap.newQuery,
        addQueryStringToQuery: outputMap.addQueryStringToQuery,
        query: options.crudMiddleware.query,
        setOutput: outputMap.setOutput(router.metadata.namePlural),
        ensureOutput: outputMap.ensureOutput({default: []}),
        filterOutput: outputMap.filterOutput,
        sendOutput: outputMap.sendOutput
    };
    return applyMaps(options.maps, steps);
}

function getByIdSteps(router, options) {
    var steps = {
        findByIdentifier: options.crudMiddleware.findByIdentifier,
        setOutput: outputMap.setOutput(router.metadata.name),
        ensureOutput: outputMap.ensureOutput({metadata: router.metadata}),
        filterOutput: outputMap.filterOutput,
        sendOutput: outputMap.sendOutput
    };
    return applyMaps(options.maps, steps);
}

function createSteps(router, options) {
    var steps = {
        validate: outputMap.validateCreation,
        create: options.crudMiddleware.create,
        filterOutput: outputMap.filterOutput,
        sendCreateResult: options.crudMiddleware.sendCreateResult
    };
    return applyMaps(options.maps, steps);
}

function updateSteps(router, options) {
    var steps = {
        validate: outputMap.validateUpdate,
        update: options.crudMiddleware.update,
        sendOutput: outputMap.sendNoContent
    };
    return applyMaps(options.maps, steps);
}

function updateStatusSteps(router, options) {
    var steps = {
        validate: outputMap.validateUpdate,
        updateStatus: options.crudMiddleware.updateStatus,
        sendOutput: outputMap.sendNoContent
    };
    return applyMaps(options.maps, steps);
}