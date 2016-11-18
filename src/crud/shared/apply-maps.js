'use strict';
var _ = require('lodash');
var util = require('util');
var paramNames = require('get-parameter-names');

module.exports = function applyMaps(maps, steps) {
    if (_.isNil(maps)) {
        return convertStepsToArray(steps);
    }
    if (!_.isObject(maps)) {
        throw new Error(util.format('The passed in map must be an object or null if no mapping is required. Type : "%s". Value : "%j"', typeof maps, maps));
    }
    applySkip(maps.skip, steps);
    applySkipIfExists(maps.skipIfExists, steps);
    applyAfter(maps.addAfter, steps, true);
    applyAfter(maps.addAfterIfExists, steps, false);
    applyBefore(maps.addBefore, steps, true);
    applyBefore(maps.addBeforeIfExists, steps, false);
    applyReplace(maps.replace, steps, true);
    applyReplace(maps.replaceIfExists, steps, false);
    applyStart(maps.startWith, steps); //todo
    applyEnd(maps.endWith, steps); //todo
    return convertStepsToArray(steps);
};

function convertStepsToArray(stepObject) {
    var steps = [];
    _.forIn(stepObject, function (value, key) {
        if (_.isNil(value)) {
            throw new Error(util.format("Step with name %s was null", key));
        }
        steps.push(value);
    });
    return steps;
}

module.exports._applySkip = applySkip;
module.exports._applySkipIfExists = applySkipIfExists;
module.exports._applyAfter = applyAfter;
module.exports._applyBefore = applyBefore;
module.exports._applyReplace = applyReplace;
module.exports._applyStart = applyStart;
module.exports._applyEnd = applyEnd;

/**
 * Skips a named step in the middleware
 * @param {string[]|string} skip The step(s) to skip in the steps object.
 * @param {object} steps The steps object
 * @returns {void}
 */
function applySkip(skip, steps) {
    _skip({skip: skip, steps: steps, throw: true});
}

function applySkipIfExists(skip, steps) {
    _skip({skip: skip, steps: steps, throw: false});
}

function _skip(options) {
    if (!_.isObject(options.steps)) {
        throw new Error("Steps must be an object");
    }
    if (_.isNil(options.skip)) {
        return;
    }
    if (_.isString(options.skip)) {
        skipStep(options.skip);
        return;
    }
    if (_.isArray(options.skip)) {
        options.skip.forEach(function (item) {
            _skip({skip: item, steps: options.steps, throw: options.throw});
        });
        return;
    }
    throw new Error("Unsupported format, should either be a string with the step name, or an array of strings with the step names");
    function skipStep(stepName) {
        if (!options.steps[stepName] && options.throw) {
            throw new Error("No step by the name of " + stepName + " was found, please check the spelling and try again");
        }
        delete options.steps[stepName];
    }
}

function applyAfter(addAfter, steps, throwIfStepNotFound) {
    var mapObjectName = paramNames(applyAfter)[0];
    var addCounter = 0;
    if (!_.isObject(steps)) {
        throw new Error("Steps must be an object");
    }
    if (_.isNil(addAfter)) {
        return;
    }
    if (!_.isObject(addAfter)) {
        throw new Error("addAfter must be an object or array of objects");
    }
    if (_.isArray(addAfter)) {
        addAfter.forEach(function (item) {
            applyAfter(item, steps, throwIfStepNotFound);
        });
        return;
    }
    if (addAfter.stepName && addAfter.add) {
        add(addAfter.stepName, addAfter.add);
        return;
    }
    var pairs = _.toPairs(addAfter);
    pairs.forEach(function (pair) {
        var stepName = pair[0];
        var functions = pair[1];
        if (!_.isArray(functions) && !_.isFunction(functions)) {
            throw new Error(util.format("The value property in the %s object should have been a function or array of functions to add but was a %s with a value of %j", mapObjectName, typeof functions, functions));
        }
        add(stepName, functions);
    });
    function add(stepName, functions) {
        if (_.isFunction(functions)) {
            add(stepName, [functions]);
            return;
        }
        if (!steps[stepName]) {
            if (throwIfStepNotFound === false) {
                return;
            }
            throw new Error("No step by the name of " + stepName + " was found, please check the spelling and try again");
        }
        var addOnNext = false;
        _.forIn(steps, function (value, key) {
            delete steps[key];
            if (addOnNext) {
                addFunctions();
            }
            if (key === stepName) {
                addOnNext = true;
            }
            steps[key] = value;
        });
        if (addOnNext) {
            addFunctions();
        }
        function addFunctions() {
            functions.forEach(function (functionToAdd) {
                addCounter++;
                steps['added' + addCounter] = functionToAdd;
            });
            addOnNext = false;
        }
    }
}

function applyBefore(addBefore, steps, throwIfStepNotFound) {
    var mapObjectName = paramNames(applyBefore)[0];
    var addCounter = 0;
    if (!_.isObject(steps)) {
        throw new Error("Steps must be an object");
    }
    if (_.isNil(addBefore)) {
        return;
    }
    if (!_.isObject(addBefore)) {
        throw new Error("addBefore must be an object or array of objects");
    }
    if (_.isArray(addBefore)) {
        addBefore.forEach(function (item) {
            applyBefore(item, steps, throwIfStepNotFound);
        });
        return;
    }
    if (addBefore.stepName && addBefore.add) {
        add(addBefore.stepName, addBefore.add);
        return;
    }
    var pairs = _.toPairs(addBefore);
    pairs.forEach(function (pair) {
        var stepName = pair[0];
        var functions = pair[1];
        if (!_.isArray(functions) && !_.isFunction(functions)) {
            throw new Error(util.format("The value property in the %s object should have been a function or array of functions to add but was a %s with a value of %j", mapObjectName, typeof functions, functions));
        }
        add(stepName, functions);
    });
    function add(stepName, functions) {
        if (_.isFunction(functions)) {
            add(stepName, [functions]);
            return;
        }
        if (!steps[stepName]) {
            if (throwIfStepNotFound === false) {
                return;
            }
            throw new Error("No step by the name of " + stepName + " was found, please check the spelling and try again");
        }
        _.forIn(steps, function (value, key) {
            delete steps[key];
            if (key === stepName) {
                addFunctions();
            }
            steps[key] = value;
        });
        function addFunctions() {
            functions.forEach(function (functionToAdd) {
                addCounter++;
                steps['added' + addCounter] = functionToAdd;
            });
        }
    }
}

function applyReplace(replaceWith, steps, throwIfStepNotFound) {
    var mapObjectName = paramNames(applyReplace)[0];
    var replaceCounter = 0;
    if (!_.isObject(steps)) {
        throw new Error("Steps must be an object");
    }
    if (_.isNil(replaceWith)) {
        return;
    }
    if (!_.isObject(replaceWith)) {
        throw new Error("replaceWith must be an object or array of objects");
    }
    if (_.isArray(replaceWith)) {
        replaceWith.forEach(function (item) {
            applyReplace(item, steps, throwIfStepNotFound);
        });
        return;
    }
    if (replaceWith.stepName && replaceWith.replacement) {
        replace(replaceWith.stepName, replaceWith.replacement);
        return;
    }
    var pairs = _.toPairs(replaceWith);
    pairs.forEach(function (pair) {
        var stepName = pair[0];
        var functions = pair[1];
        if (!_.isArray(functions) && !_.isFunction(functions)) {
            throw new Error(util.format("The value property in the %s object should have been a function or array of functions to replace but was a %s with a value of %j", mapObjectName, typeof functions, functions));
        }
        replace(stepName, functions);
    });
    function replace(stepName, functions) {
        if (_.isFunction(functions)) {
            replace(stepName, [functions]);
            return;
        }
        if (!steps[stepName]) {
            if (throwIfStepNotFound === false) {
                return;
            }
            throw new Error("No step by the name of " + stepName + " was found, please check the spelling and try again");
        }
        _.forIn(steps, function (value, key) {
            delete steps[key];
            if (key === stepName) {
                replaceFunctions();
            } else {
                steps[key] = value;
            }
        });
        function replaceFunctions() {
            functions.forEach(function (functionToAdd) {
                replaceCounter++;
                steps['replaced' + replaceCounter] = functionToAdd;
            });
        }
    }
}

function applyStart(startWith, steps) {
    if (!_.isObject(steps)) {
        throw new Error("Steps must be an object");
    }
    if (_.isNil(startWith)) {
        return;
    }
}

function applyEnd(endWith, steps) {
    if (!_.isObject(steps)) {
        throw new Error("Steps must be an object");
    }
    if (_.isNil(endWith)) {
        return;
    }
}