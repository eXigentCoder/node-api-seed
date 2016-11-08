'use strict';
var glob = require('glob');
var async = require('async');
module.exports = function findCollections(data, callback) {
    async.each(data.collections, findDataForCollection, allCollectionsSearched);
    function allCollectionsSearched(err) {
        return callback(err, data);

    }
};
function findDataForCollection(collection, callback) {
    glob('./tests/data/' + collection.name + '/*.js', function (err, results) {
        if (err) {
            return callback(err);
        }
        collection.files = [];
        results.forEach(function (result) {
            var parts = result.split('/');
            var getDataFunction = require(result.replace('./tests/data/','./'));
            var file = {
                filename: parts[4],
                globPath: result,
                data: getDataFunction()
            };
            collection.files.push(file);
        });
        return callback();
    });
}