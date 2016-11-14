'use strict';
var _ = require('lodash');
var objectPathValidation = require('./object-path-validation');
var boom = require('boom');

/**
 * Ensures that the value at the provided path on the req object is not Nil (undefined or null)
 * @param {string} path the path to the object on req
 * @param {object} options the options to use when ensuring the value exists
 * @param {*} options.default - The default value to use if the value at the path was nil (Prevents options.message from being used).
 * @param {string} options.message - The message to show if the value was nil (Prevents options.metadata from being used).
 * @param {object} options.metadata - The metadata object to use to generate the error message.
 * @return {Function} - The middleware function that will ensure the value exists on the path
 */
module.exports = function ensureExistsOnReq(path, options) {
    validate(path, options);
    return function (req, res, next) {
        if (!_.isNil(_.get(req, path))) {
            return next();
        }
        if (!_.isNil(options.default)) {
            _.set(req, path, options.default);
            return next();
        }
        if (options.message) {
            return next(boom.notFound(options.message));
        }
        if (options.metadata) {
            var message = options.metadata.title + ' with the ' + options.metadata.identifierName
                + ' of ' + req.params[options.metadata.identifierName] + ' could not be found';
            return next(boom.notFound(message));
        }
        throw new Error("Should not be possible due to the ensureExactly1KeyTruthy method in validate, called above");
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

