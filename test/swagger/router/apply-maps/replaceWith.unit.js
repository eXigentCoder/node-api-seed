'use strict';
require('../../../@util/init.js');
const applyMaps = require('../../../../src/crud/shared/apply-maps');
const applyReplace = applyMaps._applyReplace;
const Steps = require('./fake-steps');
const doWork = Steps.doWork;
describe('apply-map._applyReplace', function() {
    describe('Allows multiple input formats to the after method', function() {
        it('Should work with a single key value and a single function', function() {
            const steps = Steps();
            applyReplace({ step1: doWork }, steps);
            const actualSteps = Object.keys(steps);
            expect(actualSteps).to.deep.equal(['replaced1', 'step2', 'step3']);
        });
        it('Should work with a single key value and mulitple functions', function() {
            const steps = Steps();
            applyReplace({ step1: [doWork, doWork] }, steps);
            const actualSteps = Object.keys(steps);
            expect(actualSteps).to.deep.equal(['replaced1', 'replaced2', 'step2', 'step3']);
        });
        it('Should work with a multiple key values', function() {
            const steps = Steps();
            applyReplace({ step1: doWork, step2: doWork }, steps);
            const actualSteps = Object.keys(steps);
            expect(actualSteps).to.deep.equal(['replaced1', 'replaced2', 'step3']);
        });
        it('Should work with a single key value that is not a string', function() {
            const steps = Steps();
            applyReplace({ step1: doWork }, steps);
            const actualSteps = Object.keys(steps);
            expect(actualSteps).to.deep.equal(['replaced1', 'step2', 'step3']);
        });
        it("Should work with a 'stepName' & 'replacement' with a single function", function() {
            const steps = Steps();
            applyReplace({ stepName: 'step1', replacement: doWork }, steps);
            const actualSteps = Object.keys(steps);
            expect(actualSteps).to.deep.equal(['replaced1', 'step2', 'step3']);
        });
        it("Should work with a 'stepName' & 'replacement' with multiple functions", function() {
            const steps = Steps();
            applyReplace({ stepName: 'step1', replacement: [doWork, doWork] }, steps);
            const actualSteps = Object.keys(steps);
            expect(actualSteps).to.deep.equal(['replaced1', 'replaced2', 'step2', 'step3']);
        });
        it('Should work with an array of items with a single fn', function() {
            const steps = Steps();
            applyReplace([{ step1: doWork }], steps);
            const actualSteps = Object.keys(steps);
            expect(actualSteps).to.deep.equal(['replaced1', 'step2', 'step3']);
        });
        it('Should work with an array of items with multiple fns', function() {
            const steps = Steps();
            applyReplace([{ step1: [doWork, doWork] }], steps);
            const actualSteps = Object.keys(steps);
            expect(actualSteps).to.deep.equal(['replaced1', 'replaced2', 'step2', 'step3']);
        });
        it("Should work with an array of items with a 'stepName' & 'replacement' with a single function", function() {
            const steps = Steps();
            applyReplace([{ stepName: 'step1', replacement: doWork }], steps);
            const actualSteps = Object.keys(steps);
            expect(actualSteps).to.deep.equal(['replaced1', 'step2', 'step3']);
        });
        it("Should work with an array of items with a 'stepName' & 'replacement' with multiple functions", function() {
            const steps = Steps();
            applyReplace([{ stepName: 'step1', replacement: [doWork, doWork] }], steps);
            const actualSteps = Object.keys(steps);
            expect(actualSteps).to.deep.equal(['replaced1', 'replaced2', 'step2', 'step3']);
        });
        it('Should work with a single key value and a single function if it is added at the end', function() {
            const steps = Steps();
            applyReplace({ step3: doWork }, steps);
            const actualSteps = Object.keys(steps);
            expect(actualSteps).to.deep.equal(['step1', 'step2', 'replaced1']);
        });
    });
});
