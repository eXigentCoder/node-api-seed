'use strict';
require('../../config/init-nconf');
var async = require("async");
var user = require('../../src/routes/users/user.json');
var mongo = require('../../src/mongo');
var pluralize = require('pluralize');

async.waterfall([
    connectToDb,
    processAllItems
], function (err) {
    if (err) {
        throw err;
    }
    mongo.close(function (closeErr) {
        if (closeErr) {
            throw closeErr;
        }
        process.exit(0);
    });
});

function connectToDb(callback) {
    if (mongo.db) {
        return callback();
    }
    mongo.connect(null, function (err) {
        return callback(err);
    });
}

function processAllItems(callback) {
    var itemsToIndex = [user];
    async.each(itemsToIndex, ensureCollectionExists, callback);
}


function ensureCollectionExists(item, callback) {
    item.collectionName = item.namePlural || pluralize.plural(item.name);
    mongo.db.createCollection(item.collectionName, collectionCreated);

    function collectionCreated(err) {
        if (err) {
            return callback(err);
        }
        mongo.db.collection(item.collectionName).indexes(function (getIndexErr, indexes) {
            if (getIndexErr) {
                return callback(getIndexErr);
            }
            item.existingIndexes = indexes;
            return async.each(item.indexes, async.apply(processIndex, item), callback);
        });
    }
}

function processIndex(item, indexToCreate, callback) {
    //todo rk, compare index before trying to create a new one.
    var indexOptions = {
        background: true
    };
    if (indexToCreate.name) {
        indexOptions.name = indexToCreate.name;
    }
    if (indexToCreate.unique) {
        indexOptions.unique = indexToCreate.unique;
    }
    if (indexToCreate.expireAfterSeconds) {
        indexOptions.expireAfterSeconds = indexToCreate.expireAfterSeconds;
    }
    mongo.db.collection(item.collectionName)
        .createIndex(indexToCreate.fields, indexOptions, callback);
}