const httpMocks = require('node-mocks-http');
const events = require('events');

module.exports = {
    mockRequest,
    shouldNotCallNext,
    shouldCallNext,
    shouldCallNextWithError,
    shouldNotReturnResponse
};

function mockRequest(middlewareOrRouter, reqOptions, responseCallback, nextCallback) {
    reqOptions = reqOptions || {};
    if (!reqOptions.process) {
        reqOptions.process = {};
    }
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
    middlewareOrRouter(req, res, next);
    function next(err) {
        nextCallback(err, req, res);
    }
}

function shouldNotCallNext(done) {
    return function next(err) {
        if (err) {
            return done(err);
        }
        return done(new Error('Next should not have been called'));
    };
}

function shouldCallNext(done) {
    return function next(err) {
        if (err) {
            return done(err);
        }
        return done();
    };
}

function shouldCallNextWithError(done) {
    return function next(err) {
        if (!err) {
            return done(new Error('Should have called next with an error'));
        }
        return done();
    };
}

function shouldNotReturnResponse(done) {
    return function resComplete() {
        done(new Error('res.end should not have been called'));
    };
}
