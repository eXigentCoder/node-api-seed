'use strict';
require('../../../@util/init.js');
var applyMaps = require('../../../../src/crud/step-maps');
var applyBefore = applyMaps._applyBefore;
var Steps = require('./fake-steps');
var doWork = Steps.doWork;
describe('apply-map._applyBefore', function () {
    describe('Allows multiple input formats to the after method', function () {
        it("Should work with a single key value and a single function", function () {
            var steps = Steps();
            applyBefore({'step1': doWork}, steps);
            var actualSteps = Object.keys(steps);
            expect(actualSteps).to.deep.equal(['added1', 'step1', 'step2', 'step3']);
        });
        it("Should work with a single key value and mulitple functions", function () {
            var steps = Steps();
            applyBefore({'step1': [doWork, doWork]}, steps);
            var actualSteps = Object.keys(steps);
            expect(actualSteps).to.deep.equal(['added1', 'added2', 'step1', 'step2', 'step3']);
        });
        it("Should work with a multiple key values", function () {
            var steps = Steps();
            applyBefore({'step1': doWork, 'step2': doWork}, steps);
            var actualSteps = Object.keys(steps);
            expect(actualSteps).to.deep.equal(['added1', 'step1', 'added2', 'step2', 'step3']);
        });
        it("Should work with a single key value that is not a string", function () {
            var steps = Steps();
            applyBefore({step1: doWork}, steps);
            var actualSteps = Object.keys(steps);
            expect(actualSteps).to.deep.equal(['added1', 'step1', 'step2', 'step3']);
        });
        it("Should work with a 'stepName' & 'add' with a single function", function () {
            var steps = Steps();
            applyBefore({stepName: 'step1', add: doWork}, steps);
            var actualSteps = Object.keys(steps);
            expect(actualSteps).to.deep.equal(['added1', 'step1', 'step2', 'step3']);
        });
        it("Should work with a 'stepName' & 'add' with multiple functions", function () {
            var steps = Steps();
            applyBefore({stepName: 'step1', add: [doWork, doWork]}, steps);
            var actualSteps = Object.keys(steps);
            expect(actualSteps).to.deep.equal(['added1', 'added2', 'step1', 'step2', 'step3']);
        });
        it("Should work with an array of items with a single fn", function () {
            var steps = Steps();
            applyBefore([{'step1': doWork}], steps);
            var actualSteps = Object.keys(steps);
            expect(actualSteps).to.deep.equal(['added1', 'step1', 'step2', 'step3']);
        });
        it("Should work with an array of items with multiple fns", function () {
            var steps = Steps();
            applyBefore([{'step1': [doWork, doWork]}], steps);
            var actualSteps = Object.keys(steps);
            expect(actualSteps).to.deep.equal(['added1', 'added2', 'step1', 'step2', 'step3']);
        });
        it("Should work with an array of items with a 'stepName' & 'add' with a single function", function () {
            var steps = Steps();
            applyBefore([{stepName: 'step1', add: doWork}], steps);
            var actualSteps = Object.keys(steps);
            expect(actualSteps).to.deep.equal(['added1', 'step1', 'step2', 'step3']);
        });
        it("Should work with an array of items with a 'stepName' & 'add' with multiple functions", function () {
            var steps = Steps();
            applyBefore([{stepName: 'step1', add: [doWork, doWork]}], steps);
            var actualSteps = Object.keys(steps);
            expect(actualSteps).to.deep.equal(['added1', 'added2', 'step1', 'step2', 'step3']);
        });
        it("Should work with a single key value and a single function if it is added at the end", function () {
            var steps = Steps();
            applyBefore({'step3': doWork}, steps);
            var actualSteps = Object.keys(steps);
            expect(actualSteps).to.deep.equal(['step1', 'step2', 'added1', 'step3']);
        });
    });
});
