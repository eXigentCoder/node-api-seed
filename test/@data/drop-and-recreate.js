'use strict';
var async = require('async');
var dropExistingData = require('./drop-existing-data');
var findCollectionsToClear = require('./find-collections-to-clear');
var findItemsToCreate = require('./find-items-to-create');
var insertData = require('./insert-data');

module.exports = function dropAndRecreate(app, callback) {
    async.waterfall([
        findCollectionsToClear,
        dropExistingData,
        findItemsToCreate,
        insertData
    ], waterfallComplete);

    function waterfallComplete(err, result) {
        if (err) {
            return callback(err);
        }
        if (result) {
            console.log(JSON.stringify(result));
        }
        return callback(null, app);
    }
};
