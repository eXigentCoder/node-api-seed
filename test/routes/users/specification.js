'use strict';
var metadata = require('../../../src/routes/users').metadata;
var config = require('nconf');

var specification = {
    title: "Users",
    baseUrl: '/users',
    metadata: metadata,
    cases: {
        "Retrieval": {
            verb: 'GET',
            "By Id": {
                urlTemplate: '/:' + metadata.identifierName,
                "Happy": {
                    urlData: {}
                }
            }
        },
        "Update": {
            verb: 'PUT',
            "Replace": {
                urlTemplate: '/:' + metadata.identifierName,
                "Happy": {
                    statusCode: 204,
                    urlData: {},
                    send: 'generate-update',
                    result: 'success'
                }
            }
        }
    }
};
specification.cases.Retrieval["By Id"].Happy.urlData[metadata.identifierName] = config.get('tests').defaultUser.email;
specification.cases.Update.Replace.Happy.urlData[metadata.identifierName] = config.get('tests').defaultUser.email;
module.exports = specification;