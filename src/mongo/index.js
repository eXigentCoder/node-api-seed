'use strict';
var mongo = require('mongodb');
var ObjectId = mongo.ObjectId;
var config = require('nconf');
var MongoClient = mongo.MongoClient;
var mongodbConfig = config.get('mongodb');
var util = require('util');

var state = {
    connect: connectToDb,
    db: null,
    ObjectId: ObjectId,
    close: closeConnection,
    generateId: generateId,
    isValidObjectId: isValidObjectId,
    parseId: parseId
};
module.exports = state;

function generateId() {
    return new ObjectId();
}

function isValidObjectId(id) {
    if (!id) {
        return false;
    }
    if (id.toString().length !== 24) {
        return false;
    }
    return ObjectId.isValid(id.toString());
}

function parseId(id) {
    if (!state.isValidObjectId(id)) {
        throw new Error(util.format('Id %s is not a valid mongo id', id));
    }
    return new ObjectId(id.toString());
}

function closeConnection(callback) {
    if (!state.db) {
        return callback(new Error("db was null when calling close, may already be closed"));
    }
    state.db.close(callback);
}

function connectToDb(app, callback) {
    MongoClient.connect(mongodbConfig.url, mongodbConfig.options, connected);
    function connected(err, db) {
        if (err) {
            return callback(err);
        }
        state.db = db;
        callback(null, app);
    }
}
