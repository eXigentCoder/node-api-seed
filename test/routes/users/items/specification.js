'use strict';
var itemsMetadata = require('../../../../src/routes/users/items').metadata;

var specification = {
    title: "User Items",
    baseUrl: '/users/580d9f45622d510b044fb6a8/items',
    metadata: itemsMetadata,
    cases: {
        "Retrieval": {
            verb: 'GET',
            "By Id": {
                urlTemplate: '/:' + itemsMetadata.identifierName,
                "Happy": {
                    urlData: {}
                }
            }
        },
        "Update": {
            ignore: true,
            verb: 'PUT',
            "Replace": {
                urlTemplate: '/:' + itemsMetadata.identifierName,
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
var getByIdHappy = specification.cases.Retrieval["By Id"].Happy;
getByIdHappy.urlData[itemsMetadata.identifierName] = 'item1';
//specification.cases.Update.Replace.Happy.urlData[itemsMetadata.identifierName] = config.get('tests').defaultUser.email;
module.exports = specification;