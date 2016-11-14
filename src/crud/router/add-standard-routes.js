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

