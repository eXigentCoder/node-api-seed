'use strict';
var mongo = require('./index');
var aqp = require('api-query-params').default;
var boom = require('boom');
var _ = require('lodash');
var util = require('util');
var moment = require('moment');
//fields that need to exist in the system but should not be directly settable via PUT
var metadataFields = ['versionInfo', 'passwordHash', 'status', 'statusDate', 'statusLog', 'owner', 'ownerDate', 'ownerLog'];

module.exports = function (metadata) {
    return {
        query: query(metadata),
        findByIdentifier: findByIdentifier(metadata),
        create: create(metadata),
        update: update(metadata),
        updateStatus: updateStatus(metadata),
        getExistingMetadata: getExistingMetadata(metadata),
        writeHistoryItem: writeHistoryItem(metadata),
        deleteByIdentifier: deleteByIdentifier(metadata)
    };
};

function query(metadata) {
    return function (req, res, next) {
        var parsedQuery = parseQueryWithDefaults(req.query, metadata.schemas.core);
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

function parseQueryWithDefaults(queryString, schema) {
    var agpOptions = {
        casters: {
            mongoId: val => mongo.ObjectId(val)
        },
        castParams: {
            _id: 'mongoId',
            owner: 'mongoId'
        }
    };
    setCastParamsFromSchema(agpOptions, schema.properties);
    var parsedQuery = aqp(queryString, agpOptions);
    if (_.isObject(queryString)) {
        coerceTypes(queryString, parsedQuery.filter);
    }
    parsedQuery.projection = parsedQuery.projection || {};
    parsedQuery.skip = parsedQuery.skip || 0;
    parsedQuery.limit = parsedQuery.limit || 50;
    parsedQuery.sort = parsedQuery.sort || {};
    return parsedQuery;
}

function setCastParamsFromSchema(agpOptions, properties) {
    Object.keys(properties).forEach(function (propertyName) {
        var propertyValue = properties[propertyName];
        if (!propertyValue.type) {
            return;
        }
        if (propertyValue.type.toLowerCase() === 'object') {
            return; //todo nested properties + queries, how do they work?
        }
        if (agpOptions.castParams[propertyName]) {
            return; //don't override
        }
        agpOptions.castParams[propertyName] = propertyValue.type;
    });
    return agpOptions;
}

function coerceTypes(inputObject, filter) {
    Object.keys(filter).forEach(function (key) {
        if (!inputObject[key]) {
            return;
        }
        if (inputObject[key] instanceof mongo.ObjectId) {
            filter[key] = mongo.ObjectId(filter[key]);
        }
    });
}

function findByIdentifier(metadata) {
    return function (req, res, next) {
        var identifier = req.params[metadata.identifierName];
        if (_.isNil(identifier)) {
            return next(new Error("Object has no identifier"));
        }
        var mongoQuery = getIdentifierQuery(identifier, metadata);
        mongoQuery = _.merge({}, req.query, mongoQuery);
        var parsedQuery = parseQueryWithDefaults(mongoQuery, metadata.schemas.core);
        mongo.db.collection(metadata.collectionName)
            .findOne(parsedQuery.filter, dataRetrieved);

        function dataRetrieved(err, document) {
            if (err) {
                return next(err);
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
        var mongoQuery = getIdentifierQuery(identifier, metadata);
        var now = moment.utc().toDate();
        var updateStatement = {
            $set: {
                status: req.params.newStatusName,
                statusDate: now,
                versionInfo: req.body.versionInfo
            },
            $push: {
                statusLog: {
                    status: req.params.newStatusName,
                    data: _.omit(req.body, metadataFields),
                    statusDate: now
                }
            }
        };
        var options = {
            returnOriginal: true
        };
        var parsedQuery = parseQueryWithDefaults(mongoQuery, metadata.schemas.core);
        mongo.db.collection(metadata.collectionName)
            .findOneAndUpdate(parsedQuery.filter, updateStatement, options, updateComplete);
        function updateComplete(err, result) {
            if (err) {
                return next();
            }
            req.process.originalItem = result.value;
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
        var mongoQuery = getIdentifierQuery(identifier, metadata);
        var replacement = req.body;
        var options = {
            returnOriginal: true
        };
        var parsedQuery = parseQueryWithDefaults(mongoQuery, metadata.schemas.core);
        mongo.db.collection(metadata.collectionName)
            .findOneAndReplace(parsedQuery.filter, replacement, options, updateComplete);
        function updateComplete(err, result) {
            if (err) {
                return next();
            }
            req.process.originalItem = result.value;
            return next();
        }
    };
}

function writeHistoryItem(metadata) {
    return function _writeHistoryItem(req, res, next) {
        if (metadata.schemas.core.trackHistory !== true) {
            return next();
        }
        req.process.originalItem.historyId = req.process.originalItem._id;
        delete req.process.originalItem._id;
        mongo.db.collection(metadata.collectionName + '-history').insertOne(req.process.originalItem, next);
    };
}

function getExistingMetadata(metadata) {
    return function (req, res, next) {
        var identifier = req.params[metadata.identifierName];
        if (_.isNil(identifier)) {
            return next(new Error("Object has no identifier"));
        }
        var mongoQuery = getIdentifierQuery(identifier, metadata);
        var options = {
            fields: {}
        };
        metadataFields.forEach(function (field) {
            options.fields[field] = 1;
        });
        var parsedQuery = parseQueryWithDefaults(mongoQuery, metadata.schemas.core);
        mongo.db.collection(metadata.collectionName)
            .findOne(parsedQuery.filter, options, dataRetrieved);
        function dataRetrieved(err, document) {
            if (err) {
                return next(err);
            }
            if (!document) {
                return next(boom.notFound(util.format('A %s with the "%s" field of "%s" was not found.', metadata.name, metadata.identifierName, identifier)));
            }
            req.params[metadata.identifierName] = document._id;

            metadataFields.forEach(function (field) {
                if (document[field]) {
                    req.body[field] = document[field];
                }
            });
            return next();
        }
    };
}

function deleteByIdentifier(metadata) {
    return function (req, res, next) {
        req.process.originalItem = req.process[metadata.name];
        var identifier = req.params[metadata.identifierName];
        if (_.isNil(identifier)) {
            return next(new Error("Object has no identifier"));
        }
        var mongoQuery = getIdentifierQuery(identifier, metadata);
        var parsedQuery = parseQueryWithDefaults(mongoQuery, metadata.schemas.core);
        mongo.db.collection(metadata.collectionName)
            .deleteOne(parsedQuery.filter, documentDeleted);

        function documentDeleted(err, result) {
            if (err) {
                return next(err);
            }
            if (result.deletedCount !== 1) {
                console.warn(util.format('Expected 1 item to be deleted, but result was %s. Query : %j. Original Item : %j', result.deletedCount, mongoQuery, req.process.originalItem));
            }
            return next();
        }
    };
}