'use strict';
const mongo = require('../../src/mongo/index');
const async = require('async');

module.exports = function insertData(data, callback) {
    async.each(data.collections, insertDataForCollection, complete);
    function complete(err) {
        callback(err);
    }
};

function insertDataForCollection(collection, callback) {
    const dbCollection = mongo.db.collection(collection.name);
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
