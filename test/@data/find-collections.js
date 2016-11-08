'use strict';
var glob = require('glob');

module.exports = function findCollections(callback) {
    glob('./tests/data/**/', function (err, results) {
        if (err) {
            return callback(err);
        }
        var data = {
            collections: []
        };
        results.forEach(function (result) {
            var parts = result.split('/');
            if (parts.length !== 5) {
                return;
            }
            data.collections.push({
                name: parts[3],
                globPath: result
            });

        });
        return callback(null, data);
    });
};
