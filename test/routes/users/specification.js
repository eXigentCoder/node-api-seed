'use strict';
var metadata = require('../../../src/routes/users').metadata;
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
specification.cases.Retrieval["By Id"].Happy.urlData[metadata.identifierName] = "potz666@gmail.com";
module.exports = specification;