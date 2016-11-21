'use strict';
var ensureExistsOnReq = require('../output/ensure-exists-on-req');
var applyMaps = require('./shared/apply-maps');
var util = require('util');
var _ = require('lodash');
var roles = require('../roles');

module.exports = function addGetByIdAndUseRoute(router, path, routerOrMiddleware, crudMiddleware, maps) {
    if (_.isObject(path)) {
        //path omitted, move all args up by one.
        maps = crudMiddleware;
        crudMiddleware = routerOrMiddleware || crudMiddleware;
        routerOrMiddleware = path;
        path = '/';
    }
    if (!_.isObject(routerOrMiddleware)) {
        throw new Error(util.format("routerOrMiddleware must be a router or middleware but was of type %s with a value of %j", typeof routerOrMiddleware, routerOrMiddleware));
    }
    if (!_.isObject(crudMiddleware)) {
        throw new Error(util.format("crudMiddleware must be an object but was of type %s with a value of %j", typeof crudMiddleware, crudMiddleware));
    }
    var steps = getByIdAndUseSteps(router, routerOrMiddleware, crudMiddleware, maps);
    router.use('/:' + router.metadata.identifierName + path, steps);
    return router;
};

function getByIdAndUseSteps(router, routerOrMiddleware, crudMiddleware, maps) {
    var steps = {
        checkRole: roles.checkRole(router.metadata.namePlural, 'getById', router.metadata),
        findByIdentifier: crudMiddleware.findByIdentifier,
        ensureExistsOnReq: ensureExistsOnReq('process.' + router.metadata.name, {metadata: router.metadata})
    };
    if (_.isArray(routerOrMiddleware)) {
        routerOrMiddleware.forEach(function (item, index) {
            steps['routeOrMW' + (index + 1)] = item;
        });
    } else if (_.isFunction(routerOrMiddleware)) {
        steps.routeOrMW = routerOrMiddleware;
    }
    return applyMaps(maps, steps);
}
