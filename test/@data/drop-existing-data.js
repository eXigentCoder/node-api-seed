'use strict';
var config = require('nconf');
var async = require('async');
var mongo = require("../../src/mongo/index");

module.exports = function dropExistingData(data, callback) {
    var mongoOptions = config.get("mongodb");
    if (!mongoOptions.allowDropData) {
        return callback(new Error("Configuration is setup to not allow dropping of data. Make sure you are not on live"));
    }
    async.each(data.collections, dropCollection, allDone);

    function allDone(err) {
        return callback(err, data);
    }
};

function dropCollection(collection, callback) {
    mongo.db.dropCollection(collection.name, function (dropCollectionError) {
        if (dropCollectionError && dropCollectionError.message && dropCollectionError.message === 'ns not found') {
            console.log('Collection ' + collection.name + ' did not exist');
            return callback();
        }
        return callback(dropCollectionError);
    });
}