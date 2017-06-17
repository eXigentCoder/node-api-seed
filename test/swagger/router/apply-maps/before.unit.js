require('../../../@util/init.js');
const applyMaps = require('../../../../src/crud/shared/apply-maps');
const applyBefore = applyMaps._applyBefore;
const Steps = require('./fake-steps');
const doWork = Steps.doWork;
describe('apply-map._applyBefore', function() {
    describe('Allows multiple input formats to the after method', function() {
        it('Should work with a single key value and a single function', function() {
            const steps = Steps();
            applyBefore({ step1: doWork }, steps);
            const actualSteps = Object.keys(steps);
            expect(actualSteps).to.deep.equal(['added1', 'step1', 'step2', 'step3']);
        });
        it('Should work with a single key value and mulitple functions', function() {
            const steps = Steps();
            applyBefore({ step1: [doWork, doWork] }, steps);
            const actualSteps = Object.keys(steps);
            expect(actualSteps).to.deep.equal(['added1', 'added2', 'step1', 'step2', 'step3']);
        });
        it('Should work with a multiple key values', function() {
            const steps = Steps();
            applyBefore({ step1: doWork, step2: doWork }, steps);
            const actualSteps = Object.keys(steps);
            expect(actualSteps).to.deep.equal(['added1', 'step1', 'added2', 'step2', 'step3']);
        });
        it('Should work with a single key value that is not a string', function() {
            const steps = Steps();
            applyBefore({ step1: doWork }, steps);
            const actualSteps = Object.keys(steps);
            expect(actualSteps).to.deep.equal(['added1', 'step1', 'step2', 'step3']);
        });
        it("Should work with a 'stepName' & 'add' with a single function", function() {
            const steps = Steps();
            applyBefore({ stepName: 'step1', add: doWork }, steps);
            const actualSteps = Object.keys(steps);
            expect(actualSteps).to.deep.equal(['added1', 'step1', 'step2', 'step3']);
        });
        it("Should work with a 'stepName' & 'add' with multiple functions", function() {
            const steps = Steps();
            applyBefore({ stepName: 'step1', add: [doWork, doWork] }, steps);
            const actualSteps = Object.keys(steps);
            expect(actualSteps).to.deep.equal(['added1', 'added2', 'step1', 'step2', 'step3']);
        });
        it('Should work with an array of items with a single fn', function() {
            const steps = Steps();
            applyBefore([{ step1: doWork }], steps);
            const actualSteps = Object.keys(steps);
            expect(actualSteps).to.deep.equal(['added1', 'step1', 'step2', 'step3']);
        });
        it('Should work with an array of items with multiple fns', function() {
            const steps = Steps();
            applyBefore([{ step1: [doWork, doWork] }], steps);
            const actualSteps = Object.keys(steps);
            expect(actualSteps).to.deep.equal(['added1', 'added2', 'step1', 'step2', 'step3']);
        });
        it("Should work with an array of items with a 'stepName' & 'add' with a single function", function() {
            const steps = Steps();
            applyBefore([{ stepName: 'step1', add: doWork }], steps);
            const actualSteps = Object.keys(steps);
            expect(actualSteps).to.deep.equal(['added1', 'step1', 'step2', 'step3']);
        });
        it("Should work with an array of items with a 'stepName' & 'add' with multiple functions", function() {
            const steps = Steps();
            applyBefore([{ stepName: 'step1', add: [doWork, doWork] }], steps);
            const actualSteps = Object.keys(steps);
            expect(actualSteps).to.deep.equal(['added1', 'added2', 'step1', 'step2', 'step3']);
        });
        it('Should work with a single key value and a single function if it is added at the end', function() {
            const steps = Steps();
            applyBefore({ step3: doWork }, steps);
            const actualSteps = Object.keys(steps);
            expect(actualSteps).to.deep.equal(['step1', 'step2', 'added1', 'step3']);
        });
    });
});
