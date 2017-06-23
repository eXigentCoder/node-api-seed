require('../../@util/init.js');
import getData from '../../../src/crud/data-mapping/get-data';
import * as getDataFromReq from '../../../src/crud/data-mapping/get-data-from-req';
const sinon = require('sinon');

describe('getData', function() {
    it('Should not exist if rules was falsy', function() {
        const data = getData(null, {});
        expect(data).to.not.be.ok();
    });

    it('Should be an empty object if rules was an empty object', function() {
        const data = getData({}, {});
        expect(data).to.be.ok();
        expect(Object.keys(data)).to.have.lengthOf(0);
    });

    it('Should return an object that deep equals rules.static if only initialData.static was set', function() {
        const req = {};
        const rules = {
            static: {
                number: 1,
                string: 'test',
                bool: true,
                array: [2, 'test', true, null, {}, []],
                object: {}
            }
        };
        const data = getData(rules, req);
        expect(data).to.deep.equal(rules.static);
    });

    it('Should merge the result from getFromReqObject if rules.fromReq existed', function() {
        const req = {};
        const rules = {
            fromReq: {}
        };
        const stubbedData = {
            bob: true
        };
        const stub = sinon.stub(getDataFromReq, 'default');
        stub.returns(stubbedData);
        const data = getData(rules, req);
        stub.restore();
        expect(data.bob).to.equal(true);
    });

    it('Should merge the result from getFromReqObject and static if both were set', function() {
        const req = {};
        const rules = {
            fromReq: {},
            static: {
                number: 1,
                string: 'test',
                bool: true,
                array: [2, 'test', true, null, {}, []],
                object: {
                    subObject: {}
                }
            }
        };
        const stubbedData = {
            bob: true
        };
        const stub = sinon.stub(getDataFromReq, 'default');
        stub.returns(stubbedData);
        const data = getData(rules, req);
        stub.restore();
        expect(data.bob).to.equal(true);
        expect(data.number).to.equal(rules.static.number);
        expect(data.string).to.equal(rules.static.string);
        expect(data.bool).to.equal(rules.static.bool);
        expect(data.array).to.deep.equal(rules.static.array);
        expect(data.object).to.deep.equal(rules.static.object);
    });

    it('Should prioritise fields from getFromReqObject over static if both were set', function() {
        const req = {};
        const rules = {
            fromReq: {},
            static: {
                number: 1,
                string: 'test',
                bool: true,
                array: [2, 'test', true, null, {}, []],
                object: {
                    subObject: {}
                }
            }
        };
        const stubbedData = {
            bob: true,
            number: 2,
            string: 'test2',
            bool: false,
            array: [],
            object: {
                betterSubObject: {}
            }
        };
        const stub = sinon.stub(getDataFromReq, 'default');
        stub.returns(stubbedData);
        const data = getData(rules, req);
        stub.restore();
        expect(data.bob).to.equal(true);
        expect(data.number).to.equal(stubbedData.number);
        expect(data.string).to.equal(stubbedData.string);
        expect(data.bool).to.equal(stubbedData.bool);
        expect(data.array).to.deep.equal(rules.static.array);
        expect(data.object.subObject).to.be.ok;
        expect(data.object.betterSubObject).to.be.ok;
    });
});
