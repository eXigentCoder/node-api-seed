'use strict';
var _ = require('lodash');
var swagger = require('swagger-spec-express');
var schemaKeys = Object.keys(require('swagger-spec-express/lib/schemas/schema.json').properties);
schemaKeys.push('definitions');

module.exports = function addModels(options) {
    var schemas = {};
    schemas[options.schemas.creation.name] = options.schemas.creation;
    schemas[options.schemas.update.name] = options.schemas.update;
    schemas[options.schemas.output.name] = options.schemas.output;
    _.valuesIn(schemas).forEach(function (schema) {
        addModel(schema);
    });
};

function addModel(schema) {
    var modelSchema = _.pick(schema, schemaKeys);
    stripSpecificProperties(modelSchema);
    swagger.common.addModel(modelSchema, {validation: 'warn'});
}


const propertiesToStrip = ['faker', 'chance'];
function stripSpecificProperties(schema) {
    if (_.isArray(schema)) {
        schema.forEach(function (item) {
            stripSpecificProperties(item);
        });
        return;
    }
    if (!_.isObject(schema)) {
        return;
    }
    propertiesToStrip.forEach(function (key) {
        delete schema[key];
    });
    _.valuesIn(schema).forEach(stripSpecificProperties);
}