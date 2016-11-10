'use strict';
var mongo = require('./index');
var aqp = require('api-query-params').default;
var boom = require('boom');
var _ = require('lodash');
var util = require('util');
var moment = require('moment');

module.exports = function (metadata) {
    return {
        query: query(metadata),
        findByIdentifier: findByIdentifier(metadata),
        create: create(metadata),
        update: update(metadata),
        updateStatus: updateStatus(metadata),
        getExistingVersionInfo: getExistingVersionInfo(metadata)
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
            .project(parsedQuery.projection)
            .toArray(dataRetrieved);

        function dataRetrieved(err, docs) {
            if (err) {
                return next(err);
            }
            req.process[metadata.namePlural] = docs;
            return next();
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
    return function (req, res, next) {
        var identifier = req.params[metadata.identifierName];
        if (_.isNil(identifier)) {
            return next(new Error("Object has no identifier"));
        }
        mongo.db.collection(metadata.collectionName)
            .findOne(getIdentifierQuery(identifier, metadata), dataRetrieved);

        function dataRetrieved(err, document) {
            if (err) {
                return next(err);
            }
            if (!document) {
                return next(boom.notFound(util.format('A %s with the "%s" field of "%s" was not found.', metadata.name, metadata.identifierName, identifier)));
            }
            req.process[metadata.name] = document;
            return next();
        }
    };
}

function getIdentifierQuery(identifier, metadata) {
    if (mongo.isValidObjectId(identifier)) {
        return {_id: identifier};
    }
    var identifierQuery = {};
    identifierQuery[metadata.identifierName] = identifier;
    return identifierQuery;
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
    return function (req, res, next) {
        var identifier = req.params[metadata.identifierName];
        if (_.isNil(identifier)) {
            return next(new Error("Object has no identifier"));
        }
        var filter = getIdentifierQuery(identifier, metadata);
        var updateStatement = {
            $set: {
                status: req.params.newStatus,
                statusDate: moment.utc().toDate()
            },
            $push: {
                statusLog: {
                    status: req.params.newStatus,
                    data: req.body,
                    statusDate: moment.utc().toDate()
                }
            }
        };
        var options = {
            returnOriginal: false
        };
        mongo.db.collection(metadata.collectionName)
            .findOneAndUpdate(filter, updateStatement, options, updateComplete);
        function updateComplete(err, result) {
            if (err) {
                return next();
            }
            req.process.output = result.value;
            return next();
        }
    };
}

function update(metadata) {
    return function (req, res, next) {
        var identifier = req.params[metadata.identifierName];
        if (_.isNil(identifier)) {
            return next(new Error("Object has no identifier"));
        }
        var filter = getIdentifierQuery(identifier, metadata);
        var replacement = req.body;
        var options = {
            returnOriginal: false
        };
        mongo.db.collection(metadata.collectionName)
            .findOneAndReplace(filter, replacement, options, updateComplete);
        function updateComplete(err, result) {
            if (err) {
                return next();
            }
            req.process.output = result.value;
            return next();
        }
    };
}

function getExistingVersionInfo(metadata) {
    return function (req, res, next) {
        var identifier = req.params[metadata.identifierName];
        if (_.isNil(identifier)) {
            return next(new Error("Object has no identifier"));
        }
        var filter = getIdentifierQuery(identifier, metadata);
        var options = {
            fields: {
                'versionInfo': 1,
                'passwordHash': 1
            }
        };
        mongo.db.collection(metadata.collectionName)
            .findOne(filter, options, dataRetrieved);
        function dataRetrieved(err, document) {
            if (err) {
                return next(err);
            }
            if (!document) {
                return next(boom.notFound(util.format('A %s with the "%s" field of "%s" was not found.', metadata.name, metadata.identifierName, identifier)));
            }
            req.params[metadata.identifierName] = document._id;
            req.body.versionInfo = document.versionInfo;
            if (document.passwordHash) {
                req.body.passwordHash = document.passwordHash;
            }
            return next();
        }
    };
}