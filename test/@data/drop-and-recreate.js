'use strict';
var async = require('async');
var dropExistingData = require('./drop-existing-data');
var findItemsToCreate = require('./find-items-to-create');
var insertData = require('./insert-data');
var mongo = require('../../src/mongo/index');
var permissions = require('../../src/permissions');

module.exports = function dropAndRecreate(callback) {
    async.waterfall([
        function (cb) {
            mongo.connect(null, function (err) {
                return cb(err);
            });
        },
        dropExistingData,
        initialiseRoles,
        findItemsToCreate,
        insertData
    ], callback);
};
function initialiseRoles(callback) {
    permissions.initialise({}, function (err) {
        return callback(err);
    });
}
