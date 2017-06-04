'use strict';
const _ = require('lodash');
const swagger = require('swagger-spec-express');
const schemaKeys = Object.keys(require('swagger-spec-express/lib/schemas/schema.json').properties);
schemaKeys.push('definitions');

module.exports = function addModel(schema) {
    let schemaCopy = _.cloneDeep(schema);
    schemaCopy = cleanSchema(schemaCopy);
    swagger.common.addModel(schemaCopy, { validation: 'warn' });
};

function cleanSchema(schema) {
    schema = _.pick(schema, schemaKeys);
    if (schema.properties) {
        filterProperties(schema.properties);
    }
    if (schema.definitions) {
        Object.keys(schema.definitions).forEach(function(definitionName) {
            const definitionSchema = schema.definitions[definitionName];
            schema.definitions[definitionName] = cleanSchema(definitionSchema);
        });
    }
    return schema;
}

function filterProperties(properties) {
    Object.keys(properties).forEach(function(propertyName) {
        const propertyValue = properties[propertyName];
        Object.keys(propertyValue).forEach(function(key) {
            if (schemaKeys.indexOf(key) < 0) {
                delete propertyValue[key];
            }
            if (key.toLowerCase() === 'properties') {
                filterProperties(propertyValue.properties);
            }
            if (key.toLowerCase() === 'items') {
                filterItems(propertyValue.items);
            }
        });
    });
}

function filterItems(items) {
    if (_.isArray(items)) {
        items.forEach(function(item) {
            cleanSchema(item);
        });
        return;
    }
    cleanSchema(items);
}
