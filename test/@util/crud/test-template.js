'use strict';
var _ = require('lodash');
var jsf = require('json-schema-faker');
var util = require('util');

module.exports = function (definition) {
    var template = getTemplate();
    if (definition.metadata) {
        template.title = definition.baseUrl + ' - ' + definition.metadata.schemas.core.title;
    }
    var merged = _.merge({}, template, definition);
    generateDataWhereRequired(merged.cases, definition);
    return merged;
};

function generateDataWhereRequired(cases, definition) {
    Object.keys(cases).forEach(function (key) {
        var value = cases[key];
        if (_.isObject(value)) {
            generateDataWhereRequired(value, definition);
            return;
        }
        if (key.toLowerCase() === 'send' && value.toLowerCase().indexOf('generate-') === 0) {
            var schemaName = value.split('-')[1];
            var schema = definition.metadata.schemas[schemaName];
            if (!schema) {
                throw new Error(util.format("Schema with name %s was not found.", schemaName, Object.keys(definition.metadata.schemas)));
            }
            cases[key] = jsf(schema);
        }
    });
}

function getTemplate() {
    return {
        cases: {
            "Creation": {
                verb: 'POST',
                "Happy": {
                    send: 'generate-creation',
                    statusCode: 201,
                    result: 'success'
                },
                "Fails if empty": {
                    send: {},
                    statusCode: 400,
                    result: 'error'
                },
                "No Auth Header": {
                    auth: false,
                    statusCode: 401,
                    result: 'error'
                }
            },
            "Retrieval": {
                verb: 'GET',
                "Query": {
                    "Happy": {
                        statusCode: 200,
                        result: 'success',
                        hasResults: true
                    }
                }
            }
        }
    };
}