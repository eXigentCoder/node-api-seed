const mongo = require('./');
const aqp = require('api-query-params').default;
const boom = require('boom');
const _ = require('lodash');
const util = require('util');
const moment = require('moment');
//fields that need to exist in the system but should not be directly settable via PUT
const metadataFields = [
    'versionInfo',
    'passwordHash',
    'status',
    'statusDate',
    'statusLog',
    'owner',
    'ownerDate',
    'ownerLog'
];

module.exports = function(metadata) {
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
module.exports.getExistingMetadata = getExistingMetadata;

function query(metadata) {
    return function(req, res, next) {
        const parsedQuery = parseQueryWithDefaults(req.query, metadata.schemas.core);
        mongo.db
            .collection(metadata.collectionName)
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
    const agpOptions = {
        casters: {
            mongoId: val => mongo.ObjectId(val)
        },
        castParams: {
            _id: 'mongoId',
            owner: 'mongoId'
        }
    };
    setCastParamsFromSchema(agpOptions, schema.properties);
    const parsedQuery = aqp(queryString, agpOptions);
    parsedQuery.projection = parsedQuery.projection || {};
    parsedQuery.skip = parsedQuery.skip || 0;
    parsedQuery.limit = parsedQuery.limit || 50;
    parsedQuery.sort = parsedQuery.sort || {};
    return parsedQuery;
}

function setCastParamsFromSchema(agpOptions, properties) {
    Object.keys(properties).forEach(function(propertyName) {
        const propertyValue = properties[propertyName];
        if (!propertyValue.type) {
            return;
        }
        if (_.isArray(propertyValue.type)) {
            const types = propertyValue.type.filter(type => type.toLowerCase() !== 'null');
            if (types.length === 1) {
                agpOptions.castParams[propertyName] = types[0];
                return;
            }
            return; //todo if can be a string or int, which do we cast too?
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

function findByIdentifier(metadata) {
    return function(req, res, next) {
        const identifier = req.params[metadata.identifierName];
        if (_.isNil(identifier)) {
            return next(new Error('Object has no identifier'));
        }
        const mongoQuery = getIdentifierQuery(identifier, metadata);
        const parsedQuery = parseQueryWithDefaults(mongoQuery, metadata.schemas.core);
        mongo.db.collection(metadata.collectionName).findOne(parsedQuery.filter, dataRetrieved);

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
        return { _id: identifier };
    }
    const identifierQuery = {};
    identifierQuery[metadata.identifierName] = identifier;
    return identifierQuery;
}

function create(metadata) {
    return function(req, res, next) {
        mongo.db.collection(metadata.collectionName).insertOne(req.body, inserted);
        function inserted(err) {
            req.process.output = req.body;
            return next(err);
        }
    };
}

function updateStatus(metadata) {
    return function(req, res, next) {
        const identifier = req.params[metadata.identifierName];
        if (_.isNil(identifier)) {
            return next(new Error('Object has no identifier'));
        }
        const mongoQuery = getIdentifierQuery(identifier, metadata);
        const now = moment.utc().toDate();
        const updateStatement = {
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
        const options = {
            returnOriginal: true
        };
        const parsedQuery = parseQueryWithDefaults(mongoQuery, metadata.schemas.core);
        mongo.db
            .collection(metadata.collectionName)
            .findOneAndUpdate(parsedQuery.filter, updateStatement, options, updateComplete);
        function updateComplete(err, result) {
            if (err) {
                return next(err);
            }
            req.process.originalItem = result.value;
            return next();
        }
    };
}

function update(metadata) {
    return function(req, res, next) {
        const identifier = req.params[metadata.identifierName];
        if (_.isNil(identifier)) {
            return next(new Error('Object has no identifier'));
        }
        const mongoQuery = getIdentifierQuery(identifier, metadata);
        const replacement = req.body;
        const options = {
            returnOriginal: true
        };
        const parsedQuery = parseQueryWithDefaults(mongoQuery, metadata.schemas.core);
        mongo.db
            .collection(metadata.collectionName)
            .findOneAndReplace(parsedQuery.filter, replacement, options, updateComplete);
        function updateComplete(err, result) {
            if (err) {
                return next(err);
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
        mongo.db
            .collection(metadata.collectionName + '-history')
            .insertOne(req.process.originalItem, next);
    };
}

//todo rk this should actually be split out, it gets metadata and sets it on the req.body, should be on process.
function getExistingMetadata(metadata, targetObjectPath) {
    return function(req, res, next) {
        const identifier = req.params[metadata.identifierName];
        if (_.isNil(identifier)) {
            return next(new Error('Object has no identifier'));
        }
        const mongoQuery = getIdentifierQuery(identifier, metadata);
        const options = {
            fields: {}
        };
        metadataFields.forEach(function(field) {
            options.fields[field] = 1;
        });
        const parsedQuery = parseQueryWithDefaults(mongoQuery, metadata.schemas.core);
        mongo.db
            .collection(metadata.collectionName)
            .findOne(parsedQuery.filter, options, dataRetrieved);
        function dataRetrieved(err, document) {
            if (err) {
                return next(err);
            }
            if (!document) {
                return next(
                    boom.notFound(
                        util.format(
                            'A %s with the "%s" field of "%s" was not found.',
                            metadata.name,
                            metadata.identifierName,
                            identifier
                        )
                    )
                );
            }
            req.params[metadata.identifierName] = document._id;

            metadataFields.forEach(function(field) {
                if (document[field]) {
                    if (targetObjectPath) {
                        let obj = _.get(req, targetObjectPath);
                        if (!obj) {
                            //todo if targetObjectPath contains . need to check that each sub-object exists
                            _.set(req, targetObjectPath, {});
                            obj = _.get(req, targetObjectPath);
                        }
                        obj[field] = document[field];
                    } else {
                        req.body[field] = document[field];
                    }
                }
            });
            return next();
        }
    };
}

function deleteByIdentifier(metadata) {
    return function(req, res, next) {
        req.process.originalItem = req.process[metadata.name];
        if (!req.process.originalItem) {
            return next(
                boom.notFound(
                    util.format(
                        'A %s with the "%s" field of "%s" was not found.',
                        metadata.name,
                        metadata.identifierName,
                        req.params[metadata.identifierName]
                    )
                )
            );
        }
        const mongoQuery = { _id: req.process.originalItem._id };
        mongo.db.collection(metadata.collectionName).deleteOne(mongoQuery, documentDeleted);

        function documentDeleted(err, result) {
            if (err) {
                return next(err);
            }
            if (result.deletedCount !== 1) {
                console.warn(
                    util.format(
                        'Expected 1 item to be deleted, but result was %s. Query : %j. Original Item : %j',
                        result.deletedCount,
                        mongoQuery,
                        req.process.originalItem
                    )
                );
            }
            return next();
        }
    };
}
