'use strict';
require('./init.js');
var swagger = require('swagger-spec-express');
var _ = require('lodash');
var os = require('os');
const eol = os.EOL;
var validator = require('../../src/validate/validator');
var $RefParser = require('json-schema-ref-parser');
var util = require('util');

var swaggerSpec;
module.exports = {
    initialise: initialise,
    success: success,
    error: error,
    schemaCompare: schemaCompare,
    matchesSwaggerSchema: matchesSwaggerSchema,
    matchesSwaggerHeaders: matchesSwaggerHeaders,
    matchesSwagger: matchesSwagger,
    hasResults: hasResults,
    noResults: noResults
};

function initialise(data, callback) {
    console.log("Expect.initialise called.");
    console.log("Deref-ing swagger doc...");
    $RefParser.dereference(swagger.json(), function (err, fullSchema) {
        if (err) {
            console.log("\tError");
            return callback(err);
        }
        swaggerSpec = fullSchema;
        console.log("\tDone");
        return callback(null, data);
    });
}

function success(code) {
    if (_.isObject(code)) {
        return checkSuccessfulResponse(code);
    }
    return function (res) {
        var message = "Expected a status code of " + code + " but got " + res.statusCode + endMessageBody(res);
        expect(res.statusCode, message).to.equal(code);
        checkSuccessfulResponse(res);
    };
}

function endMessageBody(res) {
    return '. ' + messageBody(res);
}

function messageBody(res) {
    return util.format("Body : " + res.body, eol);
}

function checkSuccessfulResponse(res) {
    expect(res.statusType, "Expected a status code in the 2xx range. " + messageBody(res)).to.equal(2);
    expect(res.error, util.format('The response body contained an error : %j', res.error)).to.not.be.ok();
}

function error(code) {
    if (_.isObject(code)) {
        return checkErrorResponse(code);
    }
    return function (res) {
        var message = "Expected a status code of " + code + " but got " + res.statusCode + endMessageBody(res);
        expect(res.statusCode, message).to.equal(code);
        checkErrorResponse(res);
    };
}

function checkErrorResponse(res) {
    expect(res.statusType, "Expected a status code not in the 2xx range. " + messageBody(res)).to.not.equal(2);
    expect(res.error, 'Expected an error in the response but there was not one').to.be.ok();
}

function matchesSwagger(res) {
    var response = getSwaggerResponseObject(res);
    if (response.headers) {
        matchesSwaggerHeaders(res);
    }
    if (response.schema) {
        matchesSwaggerSchema(res);
    }
}

function matchesSwaggerHeaders(res) {
    var response = getSwaggerResponseObject(res);
    if (!response.headers) {
        throw new Error("Swagger document does not have any headers for response with status code " + res.statusCode
            + " for operation " + operationString(res));
    }
    Object.keys(response.headers).forEach(function (headerName) {
        matchesSwaggerHeader(res, headerName, response.headers[headerName]);
    });
}

function matchesSwaggerHeader(res, headerName, headerDefinition) {
    if (!res.headers) {
        throw new Error("Expected response to have header " + headerName + " but there were no headers. "
            + operationString(res));
    }
    var superTestName = headerName.toLowerCase();
    var headerValue = res.headers[superTestName];
    if (!headerValue) {
        throw new Error("Expected response to have header " + headerName + " but it was missing. "
            + operationString(res));
    }
    var actualType = typeof headerValue;
    if (headerDefinition.type.toLowerCase() !== actualType.toLowerCase()) {
        throw new Error("Expected response header " + headerName + " to have a value of type '" + headerDefinition.type
            + "' but was '" + actualType + "'" + operationString(res));
    }
}

function matchesSwaggerSchema(res) {
    var response = getSwaggerResponseObject(res);
    var schema = response.schema;
    if (!schema) {
        throw new Error("Swagger document does not have a schema for response with status code " + res.statusCode
            + " for operation " + operationString(res));
    }
    if (schema.$ref) {
        let name = getNameFrom$ref(res, schema.$ref);
        schema = getDefinitionObject(res, name);
    }
    else if (schema.type === "array" && schema.items && schema.items.$ref) {
        let name = getNameFrom$ref(res, schema.items.$ref);
        schema.items = getDefinitionObject(res, name);
    }
    ensureSchemaValid(schema, res.body);
}

function getNameFrom$ref(res, $ref) {
    var localDefinitionsString = '#/definitions/';
    if ($ref.indexOf(localDefinitionsString) !== 0) {
        throw new Error("Incorrect or unsupported $ref value : " + $ref + " for response with status code "
            + res.statusCode + " for operation " + operationString(res));
    }
    return $ref.replace(localDefinitionsString, '');
}

function getDefinitionObject(res, name) {
    if (!swaggerSpec.definitions) {
        throw new Error("Swagger document does not have any root definitions. Response with status code "
            + res.statusCode + " for operation " + operationString(res));
    }
    if (!swaggerSpec.definitions[name]) {
        throw new Error("Swagger document does not have a root definition for the " + name
            + " object for response with status code " + res.statusCode + " for operation " + operationString(res));
    }
    return swaggerSpec.definitions[name];
}

function getSwaggerResponseObject(res) {
    var operation = getSwaggerOperation(res);
    if (!operation.responses) {
        throw new Error("Swagger document does not have any responses for operation " + operationString(res));
    }
    if (!operation.responses[res.statusCode]) {
        throw new Error("Swagger document does not have the response with status code " + res.statusCode
            + " for operation " + operationString(res));
    }
    return operation.responses[res.statusCode];
}

function operationString(res) {
    return res.req.path + " - " + res.req.method.toLowerCase();
}

function getSwaggerOperation(res) {
    var verb = res.req.method.toLowerCase();
    var path = res.request.urlTemplate || res.req.path;
    var queryStartIndex = path.indexOf("?");
    if (queryStartIndex >= 0) {
        path = path.substring(0, queryStartIndex);
    }
    if (!swaggerSpec.paths) {
        throw new Error("Swagger document does not have any paths");
    }
    if (!swaggerSpec.paths[path]) {
        throw new Error("Swagger document does not have the path " + path);
    }
    if (!swaggerSpec.paths[path][verb]) {
        throw new Error("Swagger document does not have the " + verb + " method for path " + path);
    }
    return swaggerSpec.paths[path][verb];
}

function schemaCompare(schema) {
    return function (res) {
        ensureSchemaValid(schema, res.body);
    };
}

function ensureSchemaValid(schema, document) {
    validator.ensureValid(schema, document);
}

function hasResults(res) {
    if (_.isArray(res.body)) {
        expect(res.body.length).to.be.greaterThan(0);
        return;
    }
    throw new Error("hasResults should only be used with array responses");
}

function noResults(res) {
    if (_.isArray(res.body)) {
        expect(res.body.length).to.equal(0);
        return;
    }
    throw new Error("noResults should only be used with array responses");
}