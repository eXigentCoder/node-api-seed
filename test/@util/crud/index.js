'use strict';
var common = require('../integration-common');
var _ = require('lodash');
var async = require('async');
var loader = require('node-glob-loader');
var TestTemplate = require('./test-template');
var uuid = require('node-uuid');
var config = require('nconf');

describe('Crud', discoverAndRunTests);
function discoverAndRunTests() {
    var definitions = [];
    loader.load(['./test/**/specification.js', './test/**/*.specification.js'], loadTests)
        .then(testsLoaded);

    function loadTests(definition) {
        if (!_.isObject(definition)) {
            throw new Error('Definition was not an object');
        }
        definitions.push(definition);
    }

    function testsLoaded(err) {
        if (err) {
            throw err;
        }
        async.each(definitions, runTestsForDefinition);
    }
}
function runTestsForDefinition(definitionInput) {
    var definition = {};
    if (definitionInput.dontMerge) {
        definition = definitionInput;
    } else {
        definition = TestTemplate(definitionInput);
    }
    describe(definition.title, function () {
        if (!definition.cases || !_.isObject(definition.cases)) {
            return;
        }
        var keys = Object.keys(definition.cases);
        keys.forEach(async.apply(processCaseNode, definition, definition.cases));
    });
}

var cascadingProperties = [
    'verb',
    'send',
    'urlTemplate',
    'urlData',
    'auth',
    'statusCode',
    'result',
    'skipSwagger',
    'skipRequestId',
    'ignore',
    'hasResults'
];

function processCaseNode(definition, parent, key) {
    var value = parent[key];
    if (value.ignore) {
        return;
    }
    var childKeys = Object.keys(value);
    var nonCascadingChildKeys = _.difference(childKeys, cascadingProperties);
    var cascadingParentValues = _.intersection(Object.keys(parent), cascadingProperties);
    cascadingParentValues.forEach(function (cascadeKey) {
        if (_.isNil(value[cascadeKey])) {
            value[cascadeKey] = parent[cascadeKey];
        }
    });
    if (nonCascadingChildKeys.length === 0) {
        it(key, function (done) {
            executeTest(definition, value, done);
        });

    } else {
        describe(key, function () {
            this.timeout(common.defaultTimeout);
            nonCascadingChildKeys.forEach(async.apply(processCaseNode, definition, value));
        });
    }
}

function executeTest(definition, rules, done) {
    var url = definition.baseUrl;
    if (rules.urlTemplate) {
        url += rules.urlTemplate;
    }
    var test = common.request[rules.verb.toLowerCase()](url);
    if (_.isNil(rules.auth)) {
        test.set(common.authentication());
    } else {
        if (rules.auth !== false) {
            test.set(rules.auth);
        }
    }
    if (!rules.skipRequestId) {
        var correlationIdOptions = config.get('logging').correlationId;
        var header = {};
        header[correlationIdOptions.reqHeader] = uuid.v4();
        test.set(header);
    }
    if (rules.urlData) {
        test.use(common.urlTemplate(rules.urlData));
    }
    if (rules.send) {
        test.send(rules.send);
    }
    var expectedCheck;
    if (rules.result === 'error') {
        expectedCheck = common.error;
    } else {
        expectedCheck = common.success;
    }
    if (rules.statusCode) {
        test.expect(expectedCheck(rules.statusCode));
    } else {
        test.expect(expectedCheck);
    }
    if (!rules.skipSwagger) {
        test.expect(common.matchesSwagger);
    }
    if (rules.hasResults) {
        test.expect(common.hasResults);
    }
    test.end(done);
}