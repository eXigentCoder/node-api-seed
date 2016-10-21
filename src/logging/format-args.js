'use strict';
var _ = require('lodash');
var config = require('nconf');
var replacements = config.get('logging').objectReplacements;
module.exports = function formatArgs(args) {
    var argumentArray = Array.prototype.slice.call(args);
    argumentArray = argumentArray.map(mapArg);
    return argumentArray;
};

module.exports.mapArg = mapArg;
function mapArg(arg) {
    if (_.isObject(arg)) {
        sanitiseObject(arg);
        return arg;
    }
    return arg;
}

function sanitiseObject(object) {
    deepReplace(object);
}

function deepReplace(object) {
    if (!_.isObject(object)) {
        return;
    }
    if (_.isArray(object)) {
        object.forEach(function (item) {
            deepReplace(item);
        });
        return;
    }
    _.forIn(object, function (value, key) {
        replacements.forEach(function (replacement) {
            if (key.toLowerCase() !== replacement.key.toLowerCase()) {
                return;
            }
            if (_.isFunction(replacement.value)) {
                object[key] = replacement.value(value);
                return;
            }
            object[key] = replacement.value;
        });
        if (_.isObject(value)) {
            deepReplace(value);
        }
    });
}