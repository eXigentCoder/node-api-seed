'use strict';
var metadata = require('../../../src/routes/users').metadata;
var config = require('nconf');

var specification = {
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
        }
    }
};
specification.cases.Retrieval["By Id"].Happy.urlData[metadata.identifierName] = config.get('tests').defaultUser.email;
module.exports = specification;