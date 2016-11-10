'use strict';
var inferNames = require('./infer-names');
const vowels = ['a', 'e', 'i', 'o', 'u', 'A', 'E', 'I', 'O', 'U'];
var _ = require('lodash');
var ensureSchemaSet = require('./ensure-schema-set');

module.exports = function Metadata(metadata) {
    validate(metadata);
    ensureSchemaSet(metadata, 'output', 'Output');
    inferNames(metadata);
    setAOrAn(metadata);
    setIdentifierInfo(metadata);
    return metadata;
};

function validate(metadata) {
    metadata = metadata || {};
    metadata.schemas = metadata.schemas || {};
    if (_.isArray(metadata.schemas)) {
        throw new Error("metadata.schemas should not be an array.");
    }
    if (!_.isObject(metadata.schemas)) {
        throw new Error("metadata.schemas should be an object.");
    }
    if (metadata.schema) {
        metadata.schemas.core = metadata.schema;
        delete metadata.schema;
    }
    if (!metadata.schemas.core) {
        throw new Error("metadata.schemas.core is required, you can either set it directly or use the metadata.schema property.");
    }
    if (!_.isObject(metadata.schemas.core)) {
        throw new Error("metadata.schemas.core must be an object");
    }
    if (!_.isString(metadata.schemas.core.name)) {
        throw new Error("metadata.schemas.core.name must be a string");
    }
    metadata.schemas.core.name = metadata.schemas.core.name.trim();
    if (!metadata.schemas.core.name) {
        throw new Error("metadata.schemas.core.name must be a non-empty string");
    }
}

function setAOrAn(metadata) {
    metadata.aOrAn = 'A';
    if (vowels.indexOf(metadata.name[0]) >= 0) {
        metadata.aOrAn = 'An';
    }
}

function setIdentifierInfo(metadata) {
    metadata.identifierName = metadata.identifierName || metadata.schemas.core.identifierName;
    if (!metadata.identifierName) {
        throw new Error("metadata.identifierName must be set");
    }
    metadata.collectionName = metadata.namePlural;
}