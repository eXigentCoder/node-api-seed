'use strict';
var _ = require('lodash');
var create = require('../../crud/create');
var getById = require('../../crud/get-by-id');
var query = require('../../crud/query');
var update = require('../../crud/update');
var updateStatus = require('../../crud/update-status');
var getByIdAndUse = require('../../crud/get-by-id-and-use');
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
    router.getByIdAndUse = getByIdAndUse(router);
};

