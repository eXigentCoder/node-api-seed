'use strict';
var _ = require('lodash');
var jsf = require('json-schema-faker');
module.exports = function (definition) {
    var template = getTemplate();
    if (definition.metadata) {
        if (_.get('definition.cases.Creation.Happy.send')) {
            delete template.cases.Creation.Happy.send;
        } else {
            template.cases.Creation.Happy.send = jsf(definition.metadata.schemas.creation);
        }
        template.title = definition.baseUrl + ' - ' + definition.metadata.schemas.core.title;
    }
    return _.merge({}, template, definition);
};

function getTemplate() {
    return {
        cases: {
            "Creation": {
                verb: 'POST',
                "Happy": {
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