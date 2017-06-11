'use strict';
require('../../../@util/init.js');
const _ = require('lodash');
const util = require('util');
const applyMaps = require('../../../../src/crud/shared/apply-maps');
const applySkip = applyMaps._applySkip;
const applySkipIfExists = applyMaps._applySkipIfExists;
const Steps = require('./fake-steps');
const defaultFirstStepName = Object.keys(Steps())[0];
const nonexistant = 'Nope';

function callSkip(skip, steps) {
    return applySkip.bind(null, skip, steps);
}

function callSkipIfExists(skip, steps) {
    return applySkipIfExists.bind(null, skip, steps);
}

const testCases = [
    //defaultSteps
    { skip: null, steps: Steps(), throws: false },
    { skip: undefined, steps: Steps(), throws: false },
    { skip: 1, steps: Steps(), throws: true },
    { skip: NaN, steps: Steps(), throws: true },
    { skip: true, steps: Steps(), throws: true },
    { skip: false, steps: Steps(), throws: true },
    { skip: defaultFirstStepName, steps: Steps(), throws: false },
    { skip: nonexistant, steps: Steps(), throws: true, throwsWhenCallingIfExists: false },
    { skip: {}, steps: Steps(), throws: true },
    { skip: [], steps: Steps(), throws: false },
    { skip: [1], steps: Steps(), throws: true },
    { skip: [true], steps: Steps(), throws: true },
    { skip: [false], steps: Steps(), throws: true },
    { skip: [{}], steps: Steps(), throws: true },
    { skip: [nonexistant], steps: Steps(), throws: true, throwsWhenCallingIfExists: false },
    { skip: [defaultFirstStepName], steps: Steps(), throws: false },
    {
        skip: [defaultFirstStepName, nonexistant],
        steps: Steps(),
        throws: true,
        throwsWhenCallingIfExists: false
    },
    //null steps
    { skip: null, steps: null, throws: true },
    { skip: undefined, steps: null, throws: true },
    { skip: 1, steps: null, throws: true },
    { skip: NaN, steps: null, throws: true },
    { skip: true, steps: null, throws: true },
    { skip: false, steps: null, throws: true },
    { skip: defaultFirstStepName, steps: null, throws: true },
    { skip: nonexistant, steps: null, throws: true, throwsWhenCallingIfExists: true },
    { skip: {}, steps: null, throws: true },
    { skip: [], steps: null, throws: true },
    { skip: [1], steps: null, throws: true },
    { skip: [true], steps: null, throws: true },
    { skip: [false], steps: null, throws: true },
    { skip: [{}], steps: null, throws: true },
    { skip: [nonexistant], steps: null, throws: true, throwsWhenCallingIfExists: true },
    { skip: [defaultFirstStepName], steps: null, throws: true },
    //undefined steps
    { skip: null, steps: undefined, throws: true },
    { skip: undefined, steps: undefined, throws: true },
    { skip: 1, steps: undefined, throws: true },
    { skip: NaN, steps: undefined, throws: true },
    { skip: true, steps: undefined, throws: true },
    { skip: false, steps: undefined, throws: true },
    { skip: defaultFirstStepName, steps: undefined, throws: true },
    { skip: nonexistant, steps: undefined, throws: true, throwsWhenCallingIfExists: true },
    { skip: {}, steps: undefined, throws: true },
    { skip: [], steps: undefined, throws: true },
    { skip: [1], steps: undefined, throws: true },
    { skip: [true], steps: undefined, throws: true },
    { skip: [false], steps: undefined, throws: true },
    { skip: [{}], steps: undefined, throws: true },
    { skip: [nonexistant], steps: undefined, throws: true, throwsWhenCallingIfExists: true },
    { skip: [defaultFirstStepName], steps: undefined, throws: true },
    //empty object steps
    { skip: null, steps: {}, throws: false },
    { skip: undefined, steps: {}, throws: false },
    { skip: 1, steps: {}, throws: true },
    { skip: NaN, steps: {}, throws: true },
    { skip: true, steps: {}, throws: true },
    { skip: false, steps: {}, throws: true },
    { skip: defaultFirstStepName, steps: {}, throws: true, throwsWhenCallingIfExists: false },
    { skip: nonexistant, steps: {}, throws: true, throwsWhenCallingIfExists: false },
    { skip: {}, steps: {}, throws: true },
    { skip: [], steps: {}, throws: false },
    { skip: [1], steps: {}, throws: true },
    { skip: [true], steps: {}, throws: true },
    { skip: [false], steps: {}, throws: true },
    { skip: [{}], steps: {}, throws: true },
    { skip: [nonexistant], steps: {}, throws: true, throwsWhenCallingIfExists: false },
    { skip: [defaultFirstStepName], steps: {}, throws: true, throwsWhenCallingIfExists: false }
];

describe('apply-map._applySkip', function() {
    testCases.forEach(function(testCase) {
        const condition = util.format(
            'the skip argument equals %j and is of type %s and steps equals %j and is of type %s',
            testCase.skip,
            typeof testCase.skip,
            testCase.steps,
            typeof testCase.steps
        );
        if (testCase.throws) {
            let statement = 'Should throw an error if ' + condition;
            it(statement, function() {
                expect(
                    callSkip(testCase.skip, testCase.steps),
                    'Should have thrown because ' + condition
                ).to.throw();
            });
        } else {
            let statement = 'Should not throw an error if ' + condition;
            it(statement, function() {
                expect(
                    callSkip(testCase.skip, testCase.steps),
                    condition,
                    'Should not have thrown because ' + condition
                ).to.not.throw();
            });
        }
    });
    it('Should remove the step supplied if the input parameter is a string', function() {
        const steps = Steps();
        applySkip('step2', steps);
        const keys = Object.keys(steps);
        expect(keys).to.deep.equal(['step1', 'step3']);
    });
    it('Should remove the step supplied if the input parameter is a string', function() {
        const steps = Steps();
        applySkip(['step2'], steps);
        const keys = Object.keys(steps);
        expect(keys).to.deep.equal(['step1', 'step3']);
    });
    it('Should remove the step supplied if the input parameter is an array of strings', function() {
        const steps = Steps();
        applySkip(['step2', 'step1'], steps);
        const keys = Object.keys(steps);
        expect(keys).to.deep.equal(['step3']);
    });
});

describe('apply-map._applySkipIfExists', function() {
    testCases.forEach(function(testCase) {
        const condition = util.format(
            'the skip argument equals %j and is of type %s and steps equals %j and is of type %s',
            testCase.skip,
            typeof testCase.skip,
            testCase.steps,
            typeof testCase.steps
        );
        let shouldThrow;
        if (_.isNil(testCase.throwsWhenCallingIfExists)) {
            shouldThrow = testCase.throws;
        } else {
            shouldThrow = testCase.throwsWhenCallingIfExists;
        }
        if (shouldThrow) {
            let statement = 'Should throw an error if ' + condition;
            it(statement, function() {
                expect(
                    callSkipIfExists(testCase.skip, testCase.steps),
                    'Should have thrown because ' + condition
                ).to.throw();
            });
        } else {
            let statement = 'Should not throw an error if ' + condition;
            it(statement, function() {
                expect(
                    callSkipIfExists(testCase.skip, testCase.steps),
                    condition,
                    'Should not have thrown because ' + condition
                ).to.not.throw();
            });
        }
    });
    it('Should remove the step supplied if the input parameter is a string', function() {
        const steps = Steps();
        applySkipIfExists('step2', steps);
        const keys = Object.keys(steps);
        expect(keys).to.deep.equal(['step1', 'step3']);
    });
    it('Should remove the step supplied if the input parameter is a string', function() {
        const steps = Steps();
        applySkipIfExists(['step2'], steps);
        const keys = Object.keys(steps);
        expect(keys).to.deep.equal(['step1', 'step3']);
    });
    it('Should remove the step supplied if the input parameter is an array of strings', function() {
        const steps = Steps();
        applySkipIfExists(['step2', 'step1'], steps);
        const keys = Object.keys(steps);
        expect(keys).to.deep.equal(['step3']);
    });
});
