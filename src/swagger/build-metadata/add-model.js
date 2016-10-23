'use strict';
var _ = require('lodash');
var swagger = require('swagger-spec-express');
var schemaKeys = Object.keys(require('swagger-spec-express/lib/schemas/schema.json').properties);
schemaKeys.push('definitions');

module.exports = function addModel(schema) {
    var modelSchema = _.cloneDeep(_.pick(schema, schemaKeys));
    stripSpecificProperties(modelSchema);
    swagger.common.addModel(modelSchema, {validation: 'warn'});
};

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