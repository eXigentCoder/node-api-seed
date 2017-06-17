'use strict';
const _ = require('lodash');
const create = require('../create');
const getById = require('../get-by-id');
const query = require('../query');
const update = require('../update');
const updateStatus = require('../update-status');
const getByIdAndUse = require('../get-by-id-and-use');
const deleteById = require('../delete-by-id');

module.exports = function addStandardRoutes(router) {
    if (!_.isObject(router.metadata)) {
        throw new Error('Router.metadata must be set!');
    }
    router.query = function(crudMiddleware, maps) {
        if (router.crudMiddleware) {
            if (_.isNil(maps)) {
                return query(router, router.crudMiddleware, crudMiddleware);
            }
        }
        return query(router, crudMiddleware, maps);
    };
    router.getById = function(crudMiddleware, maps) {
        if (router.crudMiddleware) {
            if (_.isNil(maps)) {
                return getById(router, router.crudMiddleware, crudMiddleware);
            }
        }
        return getById(router, crudMiddleware, maps);
    };
    router.create = function(crudMiddleware, maps) {
        if (router.crudMiddleware) {
            if (_.isNil(maps)) {
                return create.addCreateRoute(router, router.crudMiddleware, crudMiddleware);
            }
        }
        return create.addCreateRoute(router, crudMiddleware, maps);
    };
    router.update = function(crudMiddleware, maps) {
        if (router.crudMiddleware) {
            if (_.isNil(maps)) {
                return update(router, router.crudMiddleware, crudMiddleware);
            }
        }
        return update(router, crudMiddleware, maps);
    };
    router.updateStatus = function(crudMiddleware, maps) {
        if (router.crudMiddleware) {
            if (_.isNil(maps)) {
                return updateStatus(router, router.crudMiddleware, crudMiddleware);
            }
        }
        return updateStatus(router, crudMiddleware, maps);
    };
    router.deleteById = function(crudMiddleware, maps) {
        if (router.crudMiddleware) {
            if (_.isNil(maps)) {
                return deleteById(router, router.crudMiddleware, crudMiddleware);
            }
        }
        return deleteById(router, crudMiddleware, maps);
    };
    router.getByIdAndUse = function(path, routerOrMiddleware, crudMiddleware, maps) {
        if (router.crudMiddleware) {
            if (_.isNil(maps)) {
                return getByIdAndUse(
                    router,
                    path,
                    routerOrMiddleware,
                    router.crudMiddleware,
                    crudMiddleware
                );
            }
        }
        return getByIdAndUse(router, path, routerOrMiddleware, crudMiddleware, maps);
    };
};
