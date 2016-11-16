'use strict';
var _ = require('lodash');
var create = require('../create');
var getById = require('../get-by-id');
var query = require('../query');
var update = require('../update');
var updateStatus = require('../update-status');
var getByIdAndUse = require('../get-by-id-and-use');
module.exports = function addStandardRoutes(router) {
    if (!_.isObject(router.metadata)) {
        throw new Error("Router.metadata must be set!");
    }
    router.query = function (crudMiddleware, maps) {
        return query(router, crudMiddleware, maps);
    };
    router.getById = function (crudMiddleware, maps) {
        return getById(router, crudMiddleware, maps);
    };
    router.create = function (crudMiddleware, maps) {
        return create(router, crudMiddleware, maps);
    };
    router.update = function (crudMiddleware, maps) {
        return update(router, crudMiddleware, maps);
    };
    router.updateStatus = function (crudMiddleware, maps) {
        return updateStatus(router, crudMiddleware, maps);
    };
    router.getByIdAndUse = function (path, routerOrMiddleware, crudMiddleware, maps) {
        return getByIdAndUse(router, path, routerOrMiddleware, crudMiddleware, maps);
    };
};

