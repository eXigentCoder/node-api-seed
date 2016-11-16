'use strict';
var jsf = require('json-schema-faker');
var customFormats = require('../../src/validate/custom-formats');
customFormats.addAllToJsf(jsf);

module.exports = function (schema) {
    return jsf(schema);
};