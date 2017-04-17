'use strict';

module.exports = function filterPropertiesForOutput(schema) {
    clearProperties(schema);
    if (schema.definitions) {
        Object.keys(schema.definitions).forEach(function (definitionName) {
            clearProperties(schema.definitions[definitionName]);
        });
    }
};

function clearProperties(schema) {
    Object.keys(schema.properties).forEach(function (propertyName) {
        const property = schema.properties[propertyName];
        if (property.excludeOnOutput === true) {
            delete schema.properties[propertyName];
            removeRequiredFieldIfExists(schema.required, propertyName);
            return;
        }
        if (property.properties) {
            clearProperties(property);
        }
    });
}

function removeRequiredFieldIfExists(array, item) {
    if (!array) {
        return;
    }
    const index = array.indexOf(item);
    if (index >= 0) {
        array.splice(index, 1);
    }
}