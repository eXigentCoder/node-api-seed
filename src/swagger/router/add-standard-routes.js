'use strict';
var _ = require('lodash');
var applyMaps = require('./step-maps');
var outputMap = require('../../output-map');
var util = require('util');
var create = require('../../crud/create');
var getById = require('../../crud/get-by-id');
var query = require('../../crud/query');
var update = require('../../crud/update');
var updateStatus = require('../../crud/update-status');
var ensureExistsOnReq = require('../../output-map/ensure-exists-on-req');
module.exports = function addStandardRoutes(router) {
    if (!_.isObject(router.metadata)) {
        throw new Error("Router.metadata must be set!");
    }
    router.add = {
        query: function (options) {
            query.addRoute(router, options);
        },
        getById: function (options) {
            getById.addRoute(router, options);
        },
        create: function (options) {
            create.addRoute(router, options);
        },
        update: function (options) {
            update.addRoute(router, options);
        },
        updateStatus: function (options) {
            updateStatus.addRoute(router, options);
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

function getByIdAndUseSteps(router, routerOrMiddleware, options) {
    var steps = {
        findByIdentifier: options.crudMiddleware.findByIdentifier,
        ensureExistsOnReq: ensureExistsOnReq('process.' + router.metadata.name, {metadata: router.metadata})
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
