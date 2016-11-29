'use strict';
var _ = require('lodash');
var config = require('nconf');
var util = require('util');
var maxDepth = 10;
module.exports = function formatArgs(args) {
    var argumentArray = Array.prototype.slice.call(args);
    argumentArray = argumentArray.map(mapArg);
    return argumentArray;
};

module.exports.mapArg = mapArg;
function mapArg(arg) {
    deepReplace(arg, 0, arg);
    return arg;
}

function deepReplace(object, counter) {
    counter = counter || 0;
    counter++;
    if (!_.isObject(object)) {
        return;
    }
    if (_.isFunction(object)) {
        return;
    }
    var replacements = config.get('logging').objectReplacements;
    _.forOwn(object, replaceSensitiveDataForObjectProperty);

    function replaceSensitiveDataForObjectProperty(value, key) {
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
            if (counter >= maxDepth) {
                object[key] = 'Object too deeply nested';
                return;
            }
            if (_.isArray(value)) {
                if (counter + 1 >= maxDepth) {
                    object[key] = '[Array Object too deeply nested]';
                    return;
                }
                value.forEach(function (item) {
                    deepReplace(item, counter);
                });
                return;
            }
            deepReplace(value, counter);
        }
    }
}