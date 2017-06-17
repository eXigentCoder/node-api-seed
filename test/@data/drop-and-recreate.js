const async = require('async');
const dropExistingData = require('./drop-existing-data');
const findItemsToCreate = require('./find-items-to-create');
const insertData = require('./insert-data');
const mongo = require('../../src/mongo/index');
const permissions = require('../../src/permissions');
const createIndexes = require('../../utilities/create-indexes/create');
module.exports = function dropAndRecreate(callback) {
    async.waterfall(
        [
            function(cb) {
                mongo.connect(null, function(err) {
                    return cb(err);
                });
            },
            dropExistingData,
            initialiseRoles,
            createIndexes,
            findItemsToCreate,
            insertData
        ],
        callback
    );
};

function initialiseRoles(callback) {
    permissions.initialise({}, function(err) {
        return callback(err);
    });
}
