'use strict';
var mongo = require('./index');
var aqp = require('api-query-params').default;
var boom = require('boom');

module.exports = function (metadata) {
    return {
        query: query(metadata),
        findByIdentifier: findByIdentifier(metadata),
        create: create(metadata),
        update: update(metadata),
        updateStatus: updateStatus(metadata)
    };
};

function query(metadata) {
    return function (req, res, next) {
        var parsedQuery = parseQueryWithDefaults(req.query);
        mongo.db.collection(metadata.collectionName)
            .find(parsedQuery.filter)
            .skip(parsedQuery.skip)
            .limit(parsedQuery.limit)
            .sort(parsedQuery.sort)
            .toArray(dataRetrieved);

        function dataRetrieved(err, docs) {
            if (err) {
                return next(err);
            }
            req.process[metadata.namePlural] = docs;
        }
    };
}

function parseQueryWithDefaults(queryString) {
    var parsedQuery = aqp(queryString);
    parsedQuery.projection = parsedQuery.projection || {};
    parsedQuery.skip = parsedQuery.skip || 0;
    parsedQuery.limit = parsedQuery.limit || 50;
    parsedQuery.sort = parsedQuery.sort || {};
    return parsedQuery;
}

function findByIdentifier(metadata) {
    //var collection = db[metadata.collectionName];
    return function (req, res, next) {
        // var identifier = req.params[metadata.identifierName];
        // if (_.isNil(identifier)) {
        //     return next(new Error("Object has no identifier"));
        // }
        // req.process[metadata.name] = collection[identifier];
        return next();
    };
}

function create(metadata) {
    return function (req, res, next) {
        mongo.db.collection(metadata.collectionName).insertOne(req.body, inserted);
        function inserted(err) {
            req.process.output = req.body;
            return next(err);
        }
    };
}

function updateStatus(metadata) {
    //var collection = db[metadata.collectionName];
    return function (req, res, next) {
        // var identifier = req.body[metadata.identifierName];
        // if (_.isNil(identifier)) {
        //     return next(new Error("Object has no identifier"));
        // }
        // if (_.isNil(collection[identifier])) {
        //     return next(boom.notFound(util.format("%s %s with %s of %s was not found.", metadata.aOrAn, metadata.title, metadata.identifierName, identifier)));
        // }
        // collection[identifier].status = req.params.newStatus;
        // collection[identifier].statusLog = collection[identifier].statusLog || [];
        // collection[identifier].statusLog.push({
        //     status: req.params.newStatus,
        //     data: req.body,
        //     date: new Date().toISOString()
        // });
        // _saveCollectionToDisk(metadata, function (err) {
        //     if (err) {
        //         return next(err);
        //     }
        //     req.process.output = req.body;
        return next();
        //});
    };
}

function update(metadata) {
    // var collection = db[metadata.collectionName];
    return function (req, res, next) {
        //     var identifier = req.body[metadata.identifierName];
        //     if (_.isNil(identifier)) {
        //         return next(new Error("Object has no identifier"));
        //     }
        //     if (_.isNil(collection[identifier])) {
        //         return next(boom.notFound(util.format("%s %s with %s of %s was not found.", metadata.aOrAn, metadata.title, metadata.identifierName, identifier)));
        //     }
        //     collection[identifier] = req.body;
        //     _saveCollectionToDisk(metadata, function (err) {
        //         if (err) {
        //             return next(err);
        //         }
        //         req.process.output = req.body;
        return next();
        //});
    };
}
