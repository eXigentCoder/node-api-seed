'use strict';
require('../@util/init.js');
const addCreateRoute = require('../../src/crud/create');
const httpMocks = require('node-mocks-http');
const events = require('events');

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
