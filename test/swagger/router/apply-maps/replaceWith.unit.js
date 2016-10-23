'use strict';
require('../../../@util/init.js');
var applyMaps = require('../../../../src/swagger/router/step-maps');
var applyReplace = applyMaps._applyReplace;
var Steps = require('./fake-steps');
var doWork = Steps.doWork;
describe('apply-map._applyReplace', function () {
    describe('Allows multiple input formats to the after method', function () {
        it("Should work with a single key value and a single function", function () {
            var steps = Steps();
            applyReplace({'step1': doWork}, steps);
            var actualSteps = Object.keys(steps);
            expect(actualSteps).to.deep.equal(['replaced1', 'step2', 'step3']);
        });
        it("Should work with a single key value and mulitple functions", function () {
            var steps = Steps();
            applyReplace({'step1': [doWork, doWork]}, steps);
            var actualSteps = Object.keys(steps);
            expect(actualSteps).to.deep.equal(['replaced1', 'replaced2', 'step2', 'step3']);
        });
        it("Should work with a multiple key values", function () {
            var steps = Steps();
            applyReplace({'step1': doWork, 'step2': doWork}, steps);
            var actualSteps = Object.keys(steps);
            expect(actualSteps).to.deep.equal(['replaced1', 'replaced2', 'step3']);
        });
        it("Should work with a single key value that is not a string", function () {
            var steps = Steps();
            applyReplace({step1: doWork}, steps);
            var actualSteps = Object.keys(steps);
            expect(actualSteps).to.deep.equal(['replaced1', 'step2', 'step3']);
        });
        it("Should work with a 'stepName' & 'replacement' with a single function", function () {
            var steps = Steps();
            applyReplace({stepName: 'step1', replacement: doWork}, steps);
            var actualSteps = Object.keys(steps);
            expect(actualSteps).to.deep.equal(['replaced1', 'step2', 'step3']);
        });
        it("Should work with a 'stepName' & 'replacement' with multiple functions", function () {
            var steps = Steps();
            applyReplace({stepName: 'step1', replacement: [doWork, doWork]}, steps);
            var actualSteps = Object.keys(steps);
            expect(actualSteps).to.deep.equal(['replaced1', 'replaced2', 'step2', 'step3']);
        });
        it("Should work with an array of items with a single fn", function () {
            var steps = Steps();
            applyReplace([{'step1': doWork}], steps);
            var actualSteps = Object.keys(steps);
            expect(actualSteps).to.deep.equal(['replaced1', 'step2', 'step3']);
        });
        it("Should work with an array of items with multiple fns", function () {
            var steps = Steps();
            applyReplace([{'step1': [doWork, doWork]}], steps);
            var actualSteps = Object.keys(steps);
            expect(actualSteps).to.deep.equal(['replaced1', 'replaced2', 'step2', 'step3']);
        });
        it("Should work with an array of items with a 'stepName' & 'replacement' with a single function", function () {
            var steps = Steps();
            applyReplace([{stepName: 'step1', replacement: doWork}], steps);
            var actualSteps = Object.keys(steps);
            expect(actualSteps).to.deep.equal(['replaced1', 'step2', 'step3']);
        });
        it("Should work with an array of items with a 'stepName' & 'replacement' with multiple functions", function () {
            var steps = Steps();
            applyReplace([{stepName: 'step1', replacement: [doWork, doWork]}], steps);
            var actualSteps = Object.keys(steps);
            expect(actualSteps).to.deep.equal(['replaced1', 'replaced2', 'step2', 'step3']);
        });
        it("Should work with a single key value and a single function if it is added at the end", function () {
            var steps = Steps();
            applyReplace({'step3': doWork}, steps);
            var actualSteps = Object.keys(steps);
            expect(actualSteps).to.deep.equal(['step1', 'step2', 'replaced1']);
        });
    });
});
