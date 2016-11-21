'use strict';
var _ = require('lodash');
var swagger = require('swagger-spec-express');
var schemaKeys = Object.keys(require('swagger-spec-express/lib/schemas/schema.json').properties);
schemaKeys.push('definitions');

module.exports = function addModel(schema) {
    var modelSchema = _.cloneDeep(_.pick(schema, schemaKeys));
    filterProperties(modelSchema.properties);
    if (modelSchema.definitions) {
        Object.keys(modelSchema.definitions).forEach(function (definitionName) {
            var definitionValue = modelSchema.definitions[definitionName];
            filterProperties(definitionValue.properties);
        });
    }
    swagger.common.addModel(modelSchema, {validation: 'warn'});
};

function filterProperties(properties) {
    Object.keys(properties).forEach(function (propertyName) {
        var propertyValue = properties[propertyName];
        Object.keys(propertyValue).forEach(function (key) {
            if (schemaKeys.indexOf(key) < 0) {
                delete propertyValue[key];
            }
            if (key.toLowerCase() === 'properties') {
                filterProperties(propertyValue.properties);
            }
        });
    });
}