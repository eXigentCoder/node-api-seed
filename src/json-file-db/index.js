'use strict';
var fs = require('fs');
var path = require('path');
var collectionsPath = path.join(__dirname, '/collections');
var fileOptions = {encoding: 'utf8'};
var db = {};
var util = require('util');
var _ = require('lodash');
var boom = require('boom');

module.exports = function (metadata) {
    loadFileFromDisk(metadata);
    return {
        query: query(metadata),
        findByIdentifier: findByIdentifier(metadata),
        create: create(metadata),
        update: update,
        updateStatus: updateStatus,
        sendCreateResult: sendCreateResult(metadata)
    };
};

function query(metadata) {
    var collection = db[metadata.collectionName];
    return function (req, res, next) {
        //req.process.query not used atm
        req.process[metadata.namePlural] = _.values(collection);
        return next();
    };
}

function findByIdentifier(metadata) {
    var collection = db[metadata.collectionName];
    return function (req, res, next) {
        var identifier = req.params[metadata.identifierName];
        if (_.isNil(identifier)) {
            return next(new Error("Object has no identifier"));
        }
        req.process[metadata.name] = collection[identifier];
        return next();
    };
}

function create(metadata) {
    var collection = db[metadata.collectionName];
    return function (req, res, next) {
        var identifier = req.body[metadata.identifierName];
        if (_.isNil(identifier)) {
            return next(new Error("Object has no identifier"));
        }
        collection[identifier] = req.body;
        saveCollectionToDisk(metadata, function (err) {
            if (err) {
                return next(err);
            }
            req.process.output = req.body;
            return next();
        });
    };
}

function updateStatus(metadata) {
    var collection = db[metadata.collectionName];
    return function (req, res, next) {
        var identifier = req.body[metadata.identifierName];
        if (_.isNil(identifier)) {
            return next(new Error("Object has no identifier"));
        }
        if (_.isNil(collection[identifier])) {
            return next(boom.notFound(util.format("%s %s with %s of %s was not found.", metadata.aOrAn, metadata.title, metadata.identifierName, identifier)));
        }
        collection[identifier].status = req.params.newStatus;
        collection[identifier].statusLog = collection[identifier].statusLog || [];
        collection[identifier].statusLog.push({
            status: req.params.newStatus,
            data: req.body,
            date: new Date().toISOString()
        });
        saveCollectionToDisk(metadata, function (err) {
            if (err) {
                return next(err);
            }
            req.process.output = req.body;
            return next();
        });
    };
}
function update(metadata) {
    var collection = db[metadata.collectionName];
    return function (req, res, next) {
        var identifier = req.body[metadata.identifierName];
        if (_.isNil(identifier)) {
            return next(new Error("Object has no identifier"));
        }
        if (_.isNil(collection[identifier])) {
            return next(boom.notFound(util.format("%s %s with %s of %s was not found.", metadata.aOrAn, metadata.title, metadata.identifierName, identifier)));
        }
        collection[identifier] = req.body;
        saveCollectionToDisk(metadata, function (err) {
            if (err) {
                return next(err);
            }
            req.process.output = req.body;
            return next();
        });
    };
}

function sendCreateResult(metadata) {
    return function (req, res) {
        var fullUrl;
        var id = req.process.output[metadata.identifierName];
        if (metadata.createdItemLocationHeader) {
            fullUrl = metadata.createdItemLocationHeader;
        } else {
            fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
        }
        fullUrl += '/' + id;
        return res.status(201)
            .location(fullUrl)
            .json(req.process.output);
    };
}

function loadFileFromDisk(metadata) {
    metadata.collectionFilePath = path.join(collectionsPath, metadata.collectionName + '.json');
    //eslint-disable-next-line no-sync
    if (fs.existsSync(metadata.collectionFilePath)) {
        //eslint-disable-next-line no-sync
        db[metadata.collectionName] = fs.readFileSync(metadata.collectionFilePath, fileOptions);
        try {
            db[metadata.collectionName] = JSON.parse(db[metadata.collectionName]);
        }
        catch (err) {
            throw new Error(util.format('Error loading db file at "%s". Message : %s', metadata.collectionFilePath, err.message));
        }
        return;
    }
    db[metadata.collectionName] = {};
    saveCollectionToDisk(metadata);
}

function saveCollectionToDisk(metadata, callback) {
    var content = JSON.stringify(db[metadata.collectionName], null, 4);
    if (_.isNil(callback)) {
        //eslint-disable-next-line no-sync
        fs.writeFileSync(metadata.collectionFilePath, content, fileOptions);
    }
    if (!_.isFunction(callback)) {
        throw new Error("Callback must be a function");
    }
    return fs.writeFile(metadata.collectionFilePath, content, fileOptions, callback);
}
