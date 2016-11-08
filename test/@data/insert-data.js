'use strict';
var MongoClient = require('mongodb').MongoClient;
var config = require('nconf');
var async = require('async');
var mongoOptions = config.get("mongodb");

module.exports = function insertData(data, callback) {
    MongoClient.connect(mongoOptions.url, mongoOptions.options, connected);

    function connected(connectionError, db) {
        if (connectionError) {
            return callback(connectionError);
        }
        async.each(data.collections, async.apply(insertDataForCollection, db), complete);
        function complete(err) {
            db.close();
            callback(err);
        }
    }
};

function insertDataForCollection(db, collection, callback) {
    var dbCollection = db.collection(collection.name);
    async.each(collection.files, async.apply(insertFile, dbCollection), callback);
}

function insertFile(dbCollection, file, callback) {
    dbCollection.insertOne(file.data, inserted);
    function inserted(err) {
        if (err) {
            console.error(file.filename + ' failed to insert');
            return callback(err);
        }
        console.log(file.filename + ' inserted successfully');
        callback();
    }
}