'use strict';
require('../@util/init.js');
const create = require('../../src/crud/create');
const mockRequest = require('../@util/request-mocking').mockRequest;
const moment = require('moment');
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');

describe('Crud - create', function() {
    describe('setStatusIfApplicable', function() {
        it('Should not set req.body.status if the provided schema has no statuses', function(done) {
            const metadata = buildMetadata();
            const middleware = create.setStatusIfApplicable(metadata);
            const reqOptions = {
                body: {}
            };
            mockRequest(middleware, reqOptions, null, next);

            function next(error) {
                expect(error).to.not.be.ok();
                expect(reqOptions.body.status).to.not.be.ok();
                expect(reqOptions.body.statusDate).to.not.be.ok();
                expect(reqOptions.body.statusLog).to.not.be.ok();
                done();
            }
        });

        it('Should set req.body.status to the first status in the schema', function(done) {
            const metadata = buildMetadata([{ name: 'a' }, { name: 'b' }]);
            const middleware = create.setStatusIfApplicable(metadata);
            const reqOptions = {
                body: {}
            };
            mockRequest(middleware, reqOptions, null, next);

            function next(error) {
                expect(error).to.not.be.ok();
                expect(reqOptions.body.status).to.equal('a');
                done();
            }
        });

        it('Should set req.body.statusDate to now', function(done) {
            const metadata = buildMetadata([{ name: 'a' }]);
            const middleware = create.setStatusIfApplicable(metadata);
            const reqOptions = {
                body: {}
            };
            mockRequest(middleware, reqOptions, null, next);

            function next(error) {
                expect(error).to.not.be.ok();
                expect(moment(reqOptions.body.statusDate).diff(new Date())).to.be.lessThan(1);
                done();
            }
        });

        it('Should create a status log with one entry', function(done) {
            const metadata = buildMetadata([{ name: 'a' }]);
            const middleware = create.setStatusIfApplicable(metadata);
            const reqOptions = {
                body: {}
            };
            mockRequest(middleware, reqOptions, null, next);

            function next(error) {
                expect(error).to.not.be.ok();
                expect(reqOptions.body.statusLog).to.be.an('array').that.has.length(1);
                done();
            }
        });

        it('Should create a status log entry with the status set to the first one in the schema', function(
            done
        ) {
            const metadata = buildMetadata([{ name: 'a' }]);
            const middleware = create.setStatusIfApplicable(metadata);
            const reqOptions = {
                body: {}
            };
            mockRequest(middleware, reqOptions, null, next);

            function next(error) {
                expect(error).to.not.be.ok();
                expect(reqOptions.body.statusLog[0].status).to.equal('a');
                done();
            }
        });

        it('Should create a status log entry with the statusDate set to now', function(done) {
            const metadata = buildMetadata([{ name: 'a' }]);
            const middleware = create.setStatusIfApplicable(metadata);
            const reqOptions = {
                body: {}
            };
            mockRequest(middleware, reqOptions, null, next);

            function next(error) {
                expect(error).to.not.be.ok();
                expect(
                    moment(reqOptions.body.statusLog[0].statusDate).diff(new Date())
                ).to.be.lessThan(1);
                done();
            }
        });

        describe('Status log data', function() {
            it('Should not exist if initialData was missing', function(done) {
                const statusToSet = {
                    name: 'a'
                };
                const metadata = buildMetadata([statusToSet]);
                const middleware = create.setStatusIfApplicable(metadata);
                const reqOptions = {
                    body: {}
                };
                mockRequest(middleware, reqOptions, null, next);

                function next(error) {
                    expect(error).to.not.be.ok();
                    const data = reqOptions.body.statusLog[0].data;
                    expect(data).to.not.be.ok();
                    done();
                }
            });

            it('Should be an empty object if initialData was an empty object', function(done) {
                const statusToSet = {
                    name: 'a',
                    initialData: {}
                };
                const metadata = buildMetadata([statusToSet]);
                const middleware = create.setStatusIfApplicable(metadata);
                const reqOptions = {
                    body: {}
                };
                mockRequest(middleware, reqOptions, null, next);

                function next(error) {
                    expect(error).to.not.be.ok();
                    const data = reqOptions.body.statusLog[0].data;
                    expect(Object.keys(data)).to.have.lengthOf(0);
                    done();
                }
            });

            it('Should be merge the result from getData', function(done) {
                const statusToSet = {
                    name: 'a',
                    initialData: {}
                };
                const metadata = buildMetadata([statusToSet]);
                const middleware = create.setStatusIfApplicable(metadata);
                const reqOptions = {
                    body: {}
                };
                const stubbedData = {
                    bob: true,
                    asd: {
                        value: 1,
                        name: 'bob'
                    }
                };
                const stub = sinon.stub(create, 'getData');
                stub.returns(stubbedData);
                mockRequest(middleware, reqOptions, null, next);

                function next(error) {
                    stub.restore();
                    expect(error).to.not.be.ok();
                    const data = reqOptions.body.statusLog[0].data;
                    expect(data).to.deep.equal(stubbedData);
                    done();
                }
            });
        });
    });

    describe('getData', function() {
        it('Should not exist if rules was falsy', function() {
            const data = create.getData(null, {});
            expect(data).to.not.be.ok();
        });

        it('Should be an empty object if rules was an empty object', function() {
            const data = create.getData({}, {});
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
            const data = create.getData(rules, req);
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
            const stub = sinon.stub(create, 'getFromReqObject');
            stub.returns(stubbedData);
            const data = create.getData(rules, req);
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
            const stub = sinon.stub(create, 'getFromReqObject');
            stub.returns(stubbedData);
            const data = create.getData(rules, req);
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
            const stub = sinon.stub(create, 'getFromReqObject');
            stub.returns(stubbedData);
            const data = create.getData(rules, req);
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

    describe('getFromReqObject', function() {
        it('Should map shallow properties from the req using the map', function() {
            const req = httpMocks.createRequest({
                a: 'b'
            });
            const map = {
                answer: 'a'
            };
            const data = create.getFromReqObject(map, req, 0, undefined, ['a']);
            expect(data.answer).to.equal('b');
        });

        it('Should map deep properties from the req using the map', function() {
            const req = httpMocks.createRequest({
                a: {
                    b: 'c'
                }
            });
            const map = {
                answer: 'a.b'
            };
            const data = create.getFromReqObject(map, req, 0, undefined, ['a']);
            expect(data.answer).to.equal('c');
        });

        it('Should support a nested map structure', function() {
            const req = httpMocks.createRequest({
                a: 'b'
            });
            const map = {
                nested: {
                    answer: 'a'
                }
            };
            const data = create.getFromReqObject(map, req, 0, undefined, ['a']);
            expect(data.nested.answer).to.equal('b');
        });

        it('Should support a nested map structure with a nested request object', function() {
            const req = httpMocks.createRequest({
                a: {
                    b: 'c'
                }
            });
            const map = {
                nested: {
                    answer: 'a.b'
                }
            };
            const data = create.getFromReqObject(map, req, 0, undefined, ['a']);
            expect(data.nested.answer).to.equal('c');
        });

        it('Should throw an error for circular reference maps', function() {
            const req = httpMocks.createRequest({
                a: {
                    b: 'c'
                }
            });
            const map = {
                nested: {}
            };
            map.nested.answer = map;
            expect(function() {
                create.getFromReqObject(map, req);
            }).to.throw(/circular reference/i);
        });

        const notAString = /must be a string/i;

        it('Should throw an error if the map was a number', function() {
            const req = httpMocks.createRequest({
                a: 'b'
            });
            const map = {
                answer: 1
            };
            expect(function() {
                create.getFromReqObject(map, req);
            }).to.throw(notAString);
        });

        it('Should throw an error if the map was a boolean', function() {
            const req = httpMocks.createRequest({
                a: 'b'
            });
            const map = {
                answer: true
            };
            expect(function() {
                create.getFromReqObject(map, req);
            }).to.throw(notAString);
        });

        it('Should not throw an error if the map was an empty object', function() {
            const req = httpMocks.createRequest({
                a: 'b'
            });
            const map = {
                answer: {}
            };
            const data = create.getFromReqObject(map, req);
            expect(data.answer).to.deep.equal({});
        });

        it('Should throw an error if the map was null', function() {
            const req = httpMocks.createRequest({
                a: 'b'
            });
            const map = {
                answer: null
            };
            expect(function() {
                create.getFromReqObject(map, req);
            }).to.throw(notAString);
        });

        it('Should throw an error if the map was undefined', function() {
            const req = httpMocks.createRequest({
                a: 'b'
            });
            const map = {
                answer: undefined
            };
            expect(function() {
                create.getFromReqObject(map, req);
            }).to.throw(notAString);
        });

        it('Should use the default value if one was supplied', function() {
            const req = httpMocks.createRequest({
                a: 'b'
            });
            const map = {
                answer: ['c', 'd']
            };
            const result = create.getFromReqObject(map, req, 0, undefined, ['c']);
            expect(result.answer).to.equal('d');
        });

        it('Should use the first value in the array for the map if only that is specified', function() {
            const req = httpMocks.createRequest({
                a: 'b'
            });
            const map = {
                answer: ['a']
            };
            const result = create.getFromReqObject(map, req, 0, undefined, ['a']);
            expect(result.answer).to.equal('b');
        });

        it('Should throw an error if the first value in the array was not a string', function() {
            const req = httpMocks.createRequest({
                a: 'b'
            });
            const map = {
                answer: [1]
            };
            expect(function() {
                create.getFromReqObject(map, req);
            }).to.throw(notAString);
        });

        it('Should throw an error if the array is empty', function() {
            const req = httpMocks.createRequest({
                a: 'b'
            });
            const map = {
                answer: []
            };
            expect(function() {
                create.getFromReqObject(map, req);
            }).to.throw(notAString);
        });

        it('Should throw an error if the array has more than 2 entries', function() {
            const req = httpMocks.createRequest({
                a: 'b'
            });
            const map = {
                answer: ['a', 'a', 'a']
            };
            expect(function() {
                create.getFromReqObject(map, req);
            }).to.throw(/too many items in array/i);
        });

        const invalidSuffix = /Map is not allowed to end with/i;
        it('Should not allow map values that end with something on the exception list', function() {
            const req = httpMocks.createRequest({
                a: {
                    b: 'c'
                }
            });
            const map = {
                answer: 'a.b'
            };
            const disallowedSuffixList = ['.b'];
            expect(function() {
                create.getFromReqObject(map, req, 0, disallowedSuffixList);
            }).to.throw(invalidSuffix);
        });

        it('Should not allow map values that end with something on the default exception list', function() {
            const req = httpMocks.createRequest({
                a: {
                    b: 'c'
                }
            });
            const map = {
                answer: 'a.password'
            };
            expect(function() {
                create.getFromReqObject(map, req);
            }).to.throw(invalidSuffix);
        });

        const invalidPrefix = /Map must start with one of /i;
        it('Should not allow access to req properties are not on the exception list', function() {
            const req = httpMocks.createRequest({
                a: {
                    b: 'c'
                }
            });
            const map = {
                answer: 'a.b'
            };
            const allowedPrefixList = [];
            expect(function() {
                create.getFromReqObject(map, req, 0, undefined, allowedPrefixList);
            }).to.throw(invalidPrefix);
        });

        it('Should not allow map values that end with something on the default exception list', function() {
            const req = httpMocks.createRequest({
                body: {
                    b: 'c'
                }
            });
            const map = {
                answer: 'body.password'
            };
            expect(function() {
                create.getFromReqObject(map, req);
            }).to.throw(invalidSuffix);
        });
    });
});

function buildMetadata(statuses) {
    const metadata = {
        schemas: {
            core: {}
        }
    };
    if (statuses) {
        metadata.schemas.core.statuses = statuses;
    }
    return metadata;
}
