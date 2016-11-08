'use strict';
var MongoClient = require('mongodb').MongoClient;
var config = require('nconf');
var async = require('async');
var mongoOptions = config.get("mongodb");

module.exports = function dropExistingData(data, callback) {
    if (!mongoOptions.allowDropData) {
        return callback(new Error("Configuration is setup to not allow dropping of data. Make sure you are not on live"));
    }
    MongoClient.connect(mongoOptions.url, mongoOptions.options, function (connectionError, db) {
        if (connectionError) {
            return callback(connectionError);
        }
        async.each(data.collections, removeDataInCollection, allDone);
        function allDone(err) {
            db.close();
            return callback(err, data);
        }

        function removeDataInCollection(collection, done) {
            db.dropCollection(collection.name, function (dropCollectionError) {
                if (dropCollectionError && dropCollectionError.message && dropCollectionError.message === 'ns not found') {
                    console.log('Collection ' + collection.name + ' did not exist');
                    return done();
                }
                return done(dropCollectionError);
            });
        }
    });
};