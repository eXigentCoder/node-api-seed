'use strict';
require('../../config/init-nconf');
var async = require("async");
var user = require('../../src/routes/users/user.json');
var mongo = require('../../src/mongo');
var pluralize = require('pluralize');
var _ = require('lodash');

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
    var indexOptions = {};
    if (!_.isNil(indexToCreate.background)) {
        indexOptions.background = indexToCreate.background;
    } else {
        indexOptions.background = true;
    }
    if (indexToCreate.name) {
        indexOptions.name = indexToCreate.name;
    }
    if (indexToCreate.unique) {
        indexOptions.unique = indexToCreate.unique;
    }
    if (indexToCreate.expireAfterSeconds) {
        indexOptions.expireAfterSeconds = indexToCreate.expireAfterSeconds;
    }
    if (indexToCreate.sparse) {
        indexOptions.sparse = indexToCreate.sparse;
    }
    if (indexToCreate.dropDups) {
        indexOptions.dropDups = indexToCreate.dropDups;
    }
    var existingIndex = findExistingIndex(indexToCreate, item.existingIndexes);
    if (!existingIndex) {
        return mongo.db.collection(item.collectionName)
            .createIndex(indexToCreate.fields, indexOptions, callback);
    }
    if (!shouldDropAndCreate(indexToCreate, item.existingIndexes)) {
        return callback();
    }
    mongo.db.collection(item.collectionName).dropIndex(existingIndex.name, function (err) {
        if (err) {
            return callback(err);
        }
        return mongo.db.collection(item.collectionName)
            .createIndex(indexToCreate.fields, indexOptions, callback);
    });
}

function findExistingIndex(indexToCreate, existingIndexes) {
    var foundIndex = null;
    existingIndexes.some(function (existingIndex) {
        if (_.isEqual(existingIndex.key, indexToCreate.fields)) {
            foundIndex = existingIndex;
            return true;
        }
        return false;
    });
    return foundIndex;
}

function shouldDropAndCreate(indexToCreate, foundIndex) {
    if (foundIndex.unique !== indexToCreate.unique) {
        return true;
    }
    if (foundIndex.name !== indexToCreate.name) {
        return true;
    }
    if (foundIndex.background !== indexToCreate.background) {
        return true;
    }
    if (foundIndex.expireAfterSeconds !== indexToCreate.expireAfterSeconds) {
        return true;
    }
    if (foundIndex.sparse !== indexToCreate.sparse) {
        return true;
    }
    if (foundIndex.dropDups !== indexToCreate.dropDups) {
        return true;
    }
    return false;
}