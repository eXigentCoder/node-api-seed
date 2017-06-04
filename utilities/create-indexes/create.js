'use strict';
require('../../config/init-nconf')('Script-CreateIndexes');
const async = require('async');
const schemas = [
    require('../../src/routes/users/user.json'),
    require('../../src/routes/users/items/item.json')
];
const mongo = require('../../src/mongo');
const pluralize = require('pluralize');
const _ = require('lodash');

module.exports = function createAll(callback) {
    async.waterfall([connectToDb, processAllItems], callback);
};

function connectToDb(callback) {
    if (mongo.db) {
        return callback();
    }
    mongo.connect(null, function(err) {
        return callback(err);
    });
}

function processAllItems(callback) {
    const itemsToIndex = [];
    schemas.forEach(function(item) {
        itemsToIndex.push(item);
        if (item.trackHistory) {
            itemsToIndex.push(createHistoryIndexItem(item));
        }
    });
    async.eachSeries(itemsToIndex, ensureCollectionExists, callback);
}

function createHistoryIndexItem(item) {
    const newItem = {
        namePlural: (item.namePlural || pluralize.plural(item.name)) + '-history',
        indexes: [
            {
                name: 'historyId',
                fields: { historyId: 1 },
                background: true,
                unique: false
            }
        ]
    };
    item.indexes.forEach(function(index) {
        if (!index.includeInHistory) {
            return;
        }
        newItem.indexes.push(index);
    });
    return newItem;
}

function ensureCollectionExists(item, callback) {
    item.collectionName = item.namePlural || pluralize.plural(item.name);
    mongo.db.createCollection(item.collectionName, collectionCreated);

    function collectionCreated(err) {
        if (err) {
            return callback(err);
        }
        mongo.db.collection(item.collectionName).indexes(function(getIndexErr, indexes) {
            if (getIndexErr) {
                return callback(getIndexErr);
            }
            item.existingIndexes = indexes;
            return async.each(item.indexes, async.apply(processIndex, item), callback);
        });
    }
}

function processIndex(item, indexToCreate, callback) {
    const indexOptions = {};
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
    let existingIndex = findExistingIndex(indexToCreate, item.existingIndexes);
    if (!existingIndex) {
        return mongo.db
            .collection(item.collectionName)
            .createIndex(indexToCreate.fields, indexOptions, callback);
    }
    if (!shouldDropAndCreate(indexToCreate, item.existingIndexes)) {
        return callback();
    }
    mongo.db.collection(item.collectionName).dropIndex(existingIndex.name, function(err) {
        if (err) {
            return callback(err);
        }
        return mongo.db
            .collection(item.collectionName)
            .createIndex(indexToCreate.fields, indexOptions, callback);
    });
}

function findExistingIndex(indexToCreate, existingIndexes) {
    let foundIndex = null;
    existingIndexes.some(function(existingIndex) {
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
