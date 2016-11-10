'use strict';
var _ = require('lodash');
var validator = require('../../validate/validator');

module.exports = function ensureSchemaSet(metadata, operation, direction) {
    if (!metadata.schemas[operation]) {
        metadata.schemas[operation] = _.cloneDeep(metadata.schemas.core);
    } else {
        ensureNotCoreId(metadata.schemas[operation], metadata.schemas.core, operation);
        ensureNotCoreName(metadata.schemas[operation], metadata.schemas.core, operation, direction);
    }
    validator.addSchema(metadata.schemas[operation]);
};

function ensureNotCoreId(schema, coreSchema, operation) {
    if (schema.id !== coreSchema.id) {
        return;
    }
    if (_.endsWith(schema, '#')) {
        schema.id += operation;
    } else {
        schema.id += "#" + operation;
    }
}

function ensureNotCoreName(schema, coreSchema, operation, direction) {
    if (schema.name !== coreSchema.name) {
        return;
    }
    operation = _.upperFirst(operation);
    if (operation === direction) {
        schema.name += direction;
        return;
    }
    schema.name += _.upperFirst(operation) + direction;
}
