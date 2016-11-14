'use strict';
var usersMetadata = require('../../../../src/routes/users').metadata;
var itemsMetadata = require('../../../../src/routes/users/items').metadata;

var specification = {
    title: "User Items",
    baseUrl: '/users/:' + usersMetadata.identifierName + '/items',
    metadata: itemsMetadata,
    cases: {
        "Creation": {
            "Happy": {},
            'Fails if empty': {},
            'No Auth Header': {}
        },
        "Retrieval": {
            verb: 'GET',
            "By Id": {
                urlTemplate: '/:' + itemsMetadata.identifierName,
                "Happy": {
                    urlData: {}
                }
            },
            "Query": {}
        },
        "Update": {
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
var updateHappy = specification.cases.Update.Replace.Happy;
var getByIdHappy = specification.cases.Retrieval['By Id'].Happy;
setUserId(getByIdHappy);
setUserId(updateHappy);
setUserId(specification.cases.Creation.Happy);
setUserId(specification.cases.Creation['Fails if empty']);
setUserId(specification.cases.Creation['No Auth Header']);
setUserId(specification.cases.Retrieval.Query);
setUserId(specification.cases.Update.Replace);
//setting itemId
setItemId(getByIdHappy);
setItemId(updateHappy);
module.exports = specification;

function setUserId(testCaseSpec, userId) {
    if (userId === undefined) {
        userId = '580d9f45622d510b044fb6a8';
    }
    testCaseSpec.urlData = testCaseSpec.urlData || {};
    testCaseSpec.urlData[usersMetadata.identifierName] = userId;
}

function setItemId(testCaseSpec, itemId) {
    if (itemId === undefined) {
        itemId = 'item1';
    }
    testCaseSpec.urlData = testCaseSpec.urlData || {};
    testCaseSpec.urlData[itemsMetadata.identifierName] = itemId;
}