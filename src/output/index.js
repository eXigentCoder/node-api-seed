'use strict';
var jsonSchemaFilter = require('json-schema-filter');
var _ = require('lodash');
var ensureExistsOnReq = require('./ensure-exists-on-req');

module.exports = {
    filter: filterOutput,
    setFrom: setOutput,
    ensureExists: ensureOutputExists,
    send: function sendOutput(req, res) {
        return res.status(200).json(req.process.output);
    },
    sendNoContent: function (req, res) {
        res.status(204).send();
    }
};

/**
 * Uses the output schema (metadata.schemas.output) to filter the req.process.output object to that schema.
 * @param {object} req Express req object
 * @param {object} res Express res object
 * @param {function} next Express next function
 * @return {*} Nothing
 */
function filterOutput(req, res, next) {
    if (!req.process.metadata.schemas.output) {
        return next(new Error("Schema must be set before you can call mapOutput"));
    }
    if (!req.process.output) {
        return next(new Error("req.process.output must be set before you can call mapOutput"));
    }
    if (_.isArray(req.process.output)) {
        req.process.output.forEach(function (item, index) {
            req.process.output[index] = jsonSchemaFilter(req.process.metadata.schemas.output, item);
        });
    } else {
        req.process.output = jsonSchemaFilter(req.process.metadata.schemas.output, req.process.output);
    }
    return next();
}

/**
 * Uses the provided lodash path to find a value on req.process and set req.process.output to that.
 * @param {string} path the lodash path to the req.process.* value
 * @return {*} Void
 */
function setOutput(path) {
    if (_.isNil(path)) {
        throw new Error("Path must be set when calling setOutput");
    }
    if (!_.isString(path)) {
        throw new Error("Path must be a string when calling setOutput");
    }
    return set('process.output', 'process.' + path);
}

/**
 * Takes in the two provided lodash paths and will set something on the destinationObject at the destinationPath from the sourcePath
 * @param {string} destinationPath - The lodash path to the destination value
 * @param {string} sourcePath - The lodash path to the source value
 * @return {function} setMiddleware - The middleware that will perform the set operation.
 */
function set(destinationPath, sourcePath) {
    if (!destinationPath || !_.isString(destinationPath)) {
        throw new Error("destinationPath must be a non empty string");
    }
    if (!sourcePath || !_.isString(sourcePath)) {
        throw new Error("sourcePath must be a non empty string");
    }
    return setMiddleware;
    function setMiddleware(req, res, next) {
        _.set(req, destinationPath, _.get(req, sourcePath));
        next();
    }
}

/**
 * Ensures that req.process.output has a value that is not nil or null
 * @param {object} options the options to use when ensuring the value exists
 * @param {*} options.default - The default value to use if the value at the path was nil (Prevents options.message from being used).
 * @param {string} options.message - The message to show if the value was nil (Prevents options.metadata from being used).
 * @param {object} options.metadata - The metadata object to use to generate the error message.
 * @return {Function} - The middleware function that will ensure the value exists on the path
 */
function ensureOutputExists(options) {
    return ensureExistsOnReq('process.output', options);
}