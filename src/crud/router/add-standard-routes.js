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
    router.add = {
        query: function (options) {
            query(router, options);
        },
        getById: function (options) {
            getById(router, options);
        },
        create: function (options) {
            create(router, options);
        },
        update: function (options) {
            update(router, options);
        },
        updateStatus: function (options) {
            updateStatus(router, options);
        }
    };
    router.query = function (options) {
        return query(router, options);
    };
    router.getById = function (options) {
        return getById(router, options);
    };
    router.create = function (options) {
        return create(router, options);
    };
    router.update = function (options) {
        return update(router, options);
    };
    router.updateStatus = function (options) {
        return updateStatus(router, options);
    };
    router.getByIdAndUse = getByIdAndUse(router);
};

