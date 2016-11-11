'use strict';
var async = require('async');
var dropExistingData = require('./drop-existing-data');
var findItemsToCreate = require('./find-items-to-create');
var insertData = require('./insert-data');

module.exports = function dropAndRecreate(app, callback) {
    async.waterfall([
        dropExistingData,
        findItemsToCreate,
        insertData
    ], waterfallComplete);

    function waterfallComplete(err) {
        if (err) {
            return callback(err);
        }
        return callback(null, app);
    }
};
