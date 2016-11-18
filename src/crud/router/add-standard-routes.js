'use strict';
var _ = require('lodash');
var create = require('../create');
var getById = require('../get-by-id');
var query = require('../query');
var update = require('../update');
var updateStatus = require('../update-status');
var getByIdAndUse = require('../get-by-id-and-use');
var deleteById = require('../delete-by-id');
module.exports = function addStandardRoutes(router) {
    if (!_.isObject(router.metadata)) {
        throw new Error("Router.metadata must be set!");
    }
    router.query = function (crudMiddleware, maps) {
        if (router.crudMiddleware) {
            if (_.isNil(maps)) {
                return query(router, router.crudMiddleware, crudMiddleware);
            }
        }
        return query(router, crudMiddleware, maps);
    };
    router.getById = function (crudMiddleware, maps) {
        if (router.crudMiddleware) {
            if (_.isNil(maps)) {
                return getById(router, router.crudMiddleware, crudMiddleware);
            }
        }
        return getById(router, crudMiddleware, maps);
    };
    router.create = function (crudMiddleware, maps) {
        if (router.crudMiddleware) {
            if (_.isNil(maps)) {
                return create(router, router.crudMiddleware, crudMiddleware);
            }
        }
        return create(router, crudMiddleware, maps);
    };
    router.update = function (crudMiddleware, maps) {
        if (router.crudMiddleware) {
            if (_.isNil(maps)) {
                return update(router, router.crudMiddleware, crudMiddleware);
            }
        }
        return update(router, crudMiddleware, maps);
    };
    router.updateStatus = function (crudMiddleware, maps) {
        if (router.crudMiddleware) {
            if (_.isNil(maps)) {
                return updateStatus(router, router.crudMiddleware, crudMiddleware);
            }
        }
        return updateStatus(router, crudMiddleware, maps);
    };
    router.deleteById = function (crudMiddleware, maps) {
        if (router.crudMiddleware) {
            if (_.isNil(maps)) {
                return deleteById(router, router.crudMiddleware, crudMiddleware);
            }
        }
        return deleteById(router, crudMiddleware, maps);
    };
    router.getByIdAndUse = function (path, routerOrMiddleware, crudMiddleware, maps) {
        if (router.crudMiddleware) {
            if (_.isNil(maps)) {
                return getByIdAndUse(router, path, routerOrMiddleware, router.crudMiddleware, crudMiddleware);
            }
        }
        return getByIdAndUse(router, path, routerOrMiddleware, crudMiddleware, maps);
    };
};

