'use strict';
var inferNames = require('./infer-names');
var setSchemas = require('./set-schemas');
const vowels = ['a', 'e', 'i', 'o', 'u', 'A', 'E', 'I', 'O', 'U'];
var _ = require('lodash');

module.exports = function Metadata(metadata) {
    validate(metadata);
    inferNames(metadata);
    setAOrAn(metadata);
    setSchemas(metadata);
    setIdentifierInfo(metadata);
    return metadata;
};

function validate(metadata) {
    metadata = metadata || {};
    metadata.schemas = metadata.schemas || {};
    if (metadata.schema) {
        metadata.schemas.core = metadata.schema;
        delete metadata.schema;
    }
    if (!metadata.schemas.core) {
        throw new Error("metadata.schemas.core is required");
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
    metadata.identifierName = metadata.identifierName || 'identifier';
    metadata.collectionId = 'todo';
    metadata.identifierPropertyName = 'identifier';
}