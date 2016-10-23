'use strict';
var util = require('util');
var boom = require('boom');
var validator = require('../../validate/validator');

module.exports = function getValidateFunction(schemaName) {
    return function validate(req, res, next) {
        if (!req.process.metadata.schemas) {
            return next(new Error('req.process.metadata.schemas must be set'));
        }
        if (!req.process.metadata.schemas[schemaName]) {
            return next(new Error('req.process.metadata.schemas.' + schemaName + ' must be set'));
        }
        if (!req.process.metadata.schemas[schemaName].id) {
            return next(new Error(util.format('req.process.metadata.schemas.' + schemaName + '.id was null. Schema was %j ', req.process.metadata.schemas[schemaName])));
        }
        var result = validator.validate(req.process.metadata.schemas[schemaName].id, req.body);
        if (!result.valid) {
            return next(boom.badRequest(result.message, result.errors));
        }
        return next();
    };
};