'use strict';
const glob = require('glob');
const async = require('async');
const path = require('path');
const _ = require('lodash');

module.exports = function(callback) {
    async.waterfall([findCollections, findDataForAllCollections], callback);
};

function findCollections(callback) {
    const folderPath = path.join(__dirname, '/*/');
    glob(folderPath, collectionsFound);

    function collectionsFound(collectionFindError, results) {
        if (collectionFindError) {
            return callback(collectionFindError);
        }
        const data = {
            collections: []
        };
        results.forEach(function(result) {
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
    const dataPath = path.join(__dirname, collection.name, '/*.js');
    glob(dataPath, dataFound);

    function dataFound(err, results) {
        if (err) {
            return callback(err);
        }
        collection.files = [];
        async.each(results, async.apply(getFileData, collection), callback);
    }
}

function getFileData(collection, result, callback) {
    const requirePath = './' + path.relative(__dirname, result).replace(/\\/g, '/');
    let fileData = require(requirePath);
    if (_.isFunction(fileData)) {
        if (fileData.length === 1) {
            return loadFileDataAsync(collection, fileData, result, callback);
        }
        fileData = fileData();
    }
    push(collection, fileData, result);
    return callback();
}
function loadFileDataAsync(collection, loadFunction, result, callback) {
    loadFunction(function(err, data) {
        if (err) {
            return callback(err);
        }
        push(collection, data, result);
        return callback();
    });
}

function push(collection, fileData, result) {
    const file = {
        filename: path.basename(result),
        globPath: result,
        data: fileData
    };
    collection.files.push(file);
}
