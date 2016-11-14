'use strict';
var ensureExistsOnReq = require('../output/ensure-exists-on-req');
var applyMaps = require('./step-maps');
var util = require('util');
var _ = require('lodash');

module.exports = function (router) {
    return function (path, routerOrMiddleware, options) {
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
