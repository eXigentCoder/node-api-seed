'use strict';
var _ = require('lodash');
/*
todo rk add tests :
 var err = new Error("testErr");
 err.custom = {bob: true};
 err.password = "asdasdas";
 console.log('test', {asd: true, password:'asd123'}, 'asd3', err, {vare: 1, password:'asd123'});
* */
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

var replacements = [
    {key: 'password', value: '****'}
];

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