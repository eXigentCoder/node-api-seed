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
