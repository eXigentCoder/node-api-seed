'use strict';
var _ = require('lodash');
var objectPathValidation = require('./object-path-validation');
var boom = require('boom');
module.exports = function ensureExistsOnReq(path, options) {
    validate(path, options);
    return function (req, res, next) {
        if (!_.isNil(_.get(req, path))) {
            return next();
        }
        if (!_.isNil(options.default)) {
            _.set(req, path, options.default);
            return res.status(200).json(req.process.output);
        }
        if (options.message) {
            return next(boom.notFound(options.message));
        }
        if (options.metadata) {
            var message = options.metadata.title + ' with the ' + options.metadata.identifierName
                + ' of ' + req.params[options.metadata.identifierName] + ' could not be found';
            return next(boom.notFound(message));
        }
        throw new Error("Should not be possible due to the ensureExactly1KeyTruthy method above");
    };
};

function validate(path, options) {
    if (!options || !_.isObject(options)) {
        throw new Error("Options must be an object when calling ensureExistsOn");
    }
    if (!_.isString(path)) {
        throw new Error("Keys must be provided as a string when calling ensureExistsOn");
    }
    objectPathValidation.ensureExactly1Key(options, ['default', 'message', 'metadata'], 'truthy');
    if (options.metadata) {
        objectPathValidation.ensureAllKeys(options.metadata, ['title', 'identifierName'], 'truthy');
    }
}

