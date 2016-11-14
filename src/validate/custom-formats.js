'use strict';
var mongo = require('../mongo');
module.exports = {
    addAllToAjv: addAllFormatsToAjv,
    addAllToJsf: addAllToJsf
};

function addAllFormatsToAjv(ajv) {
    ajv.addFormat('mongoId', function (input) {
        return mongo.isValidObjectId(input);
    });
}

function addAllToJsf(jsf) {
    jsf.format('mongoId', function () {
        return mongo.generateId();
    });
}