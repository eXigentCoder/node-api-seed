'use strict';
var async = require('async');
var chumblCore = require('@chomppackages/chumbl-core');
var collectionsToSkipWhenClearing = ['system.indexes'];
var config = require('config');

module.exports = function clearDatabase(data, callback) {
    if (process.env.NODE_ENV === 'production') {
        return callback(new Error("Do not delete the production data!"));
    }
    console.log("\tClearing db...");
    async.waterfall([
        async.apply(loadChumbl, data),
        loadCollections,
        unloadChumbl
    ], function (err) {
        console.log("\tDone");
        return callback(err, data);
    });
};

function loadChumbl(data, callback) {
    if (data.chumbl) {
        return callback(null, data);
    }
    console.log("\t\tLoading chumbl...");
    chumblCore.load(config.chumblCore, chumblLoaded);
    function chumblLoaded(err, chumbl) {
        if (err) {
            return callback(err);
        }
        if (!chumbl) {
            return callback(new Error('Chumbl was null after initializating'));
        }
        console.log("\t\tDone");
        return callback(null, data);
    }
}

function loadCollections(data, callback) {
    console.log("\t\tLoading collections...");
    chumblCore.db.collections(collectionsRetrieved);
    function collectionsRetrieved(err, collections) {
        if (err) {
            return callback(err);
        }
        console.log("\t\tDone.");
        console.log("\t\tClearing items in collections...");
        return async.each(collections, clearItemsInCollection, allItemsCleared);
    }

    function allItemsCleared(err) {
        console.log("\t\tDone");
        return callback(err, data);
    }
}

function clearItemsInCollection(item, callback) {
    var name = item.s.name;
    if (collectionsToSkipWhenClearing.indexOf(name) >= 0) {
        return callback();
    }
    return item.deleteMany({}, itemsDeleted);
    function itemsDeleted(err) {
        if (err) {
            console.error("Error clearing items from " + name);
        }
        return callback(err);
    }
}

function unloadChumbl(options, callback) {
    if (options.chumbl) {
        return callback(null, options);
    }
    console.log("\t\tUnloading chumbl...");
    chumblCore.unload(callback);
}