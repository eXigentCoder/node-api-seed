'use strict';
var glob = require('glob');
var async = require('async');
var path = require('path');
var _ = require('lodash');

module.exports = function (callback) {
    async.waterfall([
        findCollections,
        findDataForAllCollections
    ], callback);
};

function findCollections(callback) {
    var folderPath = path.join(__dirname, '/*/');
    glob(folderPath, collectionsFound);

    function collectionsFound(collectionFindError, results) {
        if (collectionFindError) {
            return callback(collectionFindError);
        }
        var data = {
            collections: []
        };
        results.forEach(function (result) {
            data.collections.push({
                name: path.basename(result),
                globPath: result
            });
        });
        return callback(null, data);
    }
}

function findDataForAllCollections(data, callback) {
    async.each(data.collections, findDataForCollection, done);

    function done(err) {
        return callback(err, data);
    }
}

function findDataForCollection(collection, callback) {
    var dataPath = path.join(__dirname, collection.name, '/*.js');
    glob(dataPath, dataFound);

    function dataFound(err, results) {
        if (err) {
            return callback(err);
        }
        collection.files = [];
        results.forEach(function (result) {
            var requirePath = './' + path.relative(__dirname, result).replace(/\\/g, '/');
            var fileData = require(requirePath);
            if (_.isFunction(fileData)) {
                fileData = fileData();
            }
            var file = {
                filename: path.basename(result),
                globPath: result,
                data: fileData
            };
            collection.files.push(file);
        });
        return callback();
    }
}