'use strict';
require('../@util/init.js');
const addCreateRoute = require('../../src/crud/create');
const httpMocks = require('node-mocks-http');
const events = require('events');
const moment = require('moment');

describe('Crud - create', function() {
    describe('setStatusIfApplicable', function() {
        it('Should not set req.body.status if the provided schema has no statuses', function(done) {
            const metadata = buildMetadata();
            const middleware = addCreateRoute.setStatusIfApplicable(metadata);
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
            const middleware = addCreateRoute.setStatusIfApplicable(metadata);
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
            const middleware = addCreateRoute.setStatusIfApplicable(metadata);
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
            const middleware = addCreateRoute.setStatusIfApplicable(metadata);
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

        it('Should create a status log entry with the status set to the first one in the schema', function(done) {
            const metadata = buildMetadata([{ name: 'a' }]);
            const middleware = addCreateRoute.setStatusIfApplicable(metadata);
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
            const middleware = addCreateRoute.setStatusIfApplicable(metadata);
            const reqOptions = {
                body: {}
            };
            mockRequest(middleware, reqOptions, null, next);

            function next(error) {
                expect(error).to.not.be.ok();
                expect(moment(reqOptions.body.statusLog[0].statusDate).diff(new Date())).to.be.lessThan(1);
                done();
            }
        });

        describe('Status log data', function() {
            it('Should not exist if initialData was missing', function(done) {
                const statusToSet = {
                    name: 'a'
                };
                const metadata = buildMetadata([statusToSet]);
                const middleware = addCreateRoute.setStatusIfApplicable(metadata);
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
                const middleware = addCreateRoute.setStatusIfApplicable(metadata);
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

            it('Should be an object that deep equals initialData.static if only initialData.static was set', function(
                done
            ) {
                const statusToSet = {
                    name: 'a',
                    initialData: {
                        static: {
                            number: 1,
                            string: 'test',
                            bool: true,
                            array: [2, 'test', true, null, {}, []],
                            object: {}
                        }
                    }
                };
                const metadata = buildMetadata([statusToSet]);
                const middleware = addCreateRoute.setStatusIfApplicable(metadata);
                const reqOptions = {
                    body: {}
                };
                mockRequest(middleware, reqOptions, null, next);

                function next(error) {
                    expect(error).to.not.be.ok();
                    const data = reqOptions.body.statusLog[0].data;
                    expect(data).to.deep.equal(statusToSet.initialData.static);
                    done();
                }
            });
            it('Should be an object with properties taken from the request object if only initialData.fromReq was set', function(
                done
            ) {
                const reqOptions = {
                    body: {},
                    user: {
                        username: 'Bob'
                    }
                };
                const statusToSet = {
                    name: 'a',
                    initialData: {
                        fromReq: {
                            username: 'user.username',
                            doesNotExist: 'a',
                            nested: {
                                initialUsername: 'user.username'
                            }
                            //TODO what if not a string or object value? i.e. [boolean, null, undefined, array, number]
                            //TODO what if value isn't found? should we use "asdasd: ['a','defaultValue']" to denote using defaults? or do we throw an error?
                            //TODO security around retrieving things from request? Maybe only from certain parts of req? req.params? req.query? req.body? req.process?
                            //TODO if fromReq and static are both set, it will merge in an order, what about conflicts? Error?
                            //TODO refactor this fromReq code with detailed logic into it's own describe block for getFromReqObject
                        }
                    }
                };
                const metadata = buildMetadata([statusToSet]);
                const middleware = addCreateRoute.setStatusIfApplicable(metadata);

                mockRequest(middleware, reqOptions, null, next);

                function next(error) {
                    expect(error).to.not.be.ok();
                    const data = reqOptions.body.statusLog[0].data;
                    expect(data.username).to.equal('Bob');
                    expect(data.doesNotExist).to.not.be.ok();
                    expect(data.nested.initialUsername).to.equal('Bob');
                    done();
                }
            });
        });
    });
    describe('getFromReqObject', function() {

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

function mockRequest(middlewareOrRouter, reqOptions, responseCallback, nextCallback) {
    const req = httpMocks.createRequest(reqOptions);
    const res = httpMocks.createResponse({
        eventEmitter: events.EventEmitter
    });
    res.on('end', function() {
        let resToReturn;
        try {
            resToReturn = {
                statusCode: res._getStatusCode(),
                body: JSON.parse(res._getData()),
                headers: res._getHeaders(),
                raw: res
            };
        } catch (err) {
            return responseCallback(err);
        }
        responseCallback(null, resToReturn);
    });
    middlewareOrRouter(req, res, nextCallback);
}

// function shouldNotCallNext(done) {
//     return function next(err) {
//         if (err) {
//             return done(err);
//         }
//         return done(new Error('Next should not have been called'));
//     };
// }
//
// function shouldCallNext(done) {
//     return function next(err) {
//         if (err) {
//             return done(err);
//         }
//         return done();
//     };
// }
//
// function shouldNotReturnResponse(done) {
//     return function resComplete() {
//         done(new Error('res.end should not have been called'));
//     };
// }
