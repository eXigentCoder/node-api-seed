'use strict';
const jsf = require('json-schema-faker');
const customFormats = require('../../src/validate/custom-formats');
customFormats.addAllToJsf(jsf);

module.exports = function (schema) {
    return jsf(schema);
};