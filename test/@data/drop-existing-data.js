const mongo = require('../../src/mongo/index');
const async = require('async');
const util = require('util');
module.exports = function findCollections(callback) {
    console.log('Loading collections...');
    mongo.db.collections(collectionsRetrieved);
    function collectionsRetrieved(err, collections) {
        if (err) {
            return callback(err);
        }
        console.log('\tDone.');
        console.log('Clearing items in collections...');
        return async.each(collections, clearItemsInCollection, callback);
    }
};
const collectionsToSkipWhenClearing = ['system.indexes'];

function clearItemsInCollection(item, callback) {
    const name = item.s.name;
    if (collectionsToSkipWhenClearing.indexOf(name) >= 0) {
        return callback();
    }
    mongo.db.dropCollection(name, function(err) {
        if (err && err.message && err.message === 'ns not found') {
            console.log(util.format('Collection %s did not exist', name));
            return callback();
        }
        return callback(err);
    });
}
