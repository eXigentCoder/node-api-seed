require('../@util/init.js');
const httpMocks = require('node-mocks-http');
const uuid = require('node-uuid');
const versionMiddleware = require('../../src/version-info');
const config = require('nconf');

describe('when setting the version info of requests', function() {
    let request;
    let response;
    const validUUIDRegexPattern = new RegExp(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
        'i'
    );

    beforeEach(function() {
        response = httpMocks.createResponse();
    });

    describe('when processing an add request', function() {
        beforeEach(function() {
            const correlationIdOptions = config.get('logging').correlationId;
            const reqOptions = {
                method: 'POST',
                url: '/user',
                headers: {},
                user: {
                    _id: '333'
                },
                body: {}
            };
            reqOptions.headers[correlationIdOptions.reqHeader] = 'uniquerequestid';
            request = httpMocks.createRequest(reqOptions);

            versionMiddleware.add(request, response, function() {
                return null;
            });
        });

        it('should set the request id in the body', function() {
            expect(request.body.versionInfo.updatedByRequestId).to.equal('uniquerequestid');
        });

        it('should set the version tag as a valid uuid', function() {
            expect(validUUIDRegexPattern.test(request.body.versionInfo.versionTag)).to.equal(true);
        });

        it('should set the created and updated dates', function() {
            expect(request.body.versionInfo.dateCreated).to.be.a('date');
            expect(request.body.versionInfo.dateUpdated).to.be.a('date');
        });

        it('should set the created and update by fields to the user id', function() {
            expect(request.body.versionInfo.createdBy).to.equal('333');
            expect(request.body.versionInfo.lastUpdatedBy).to.equal('333');
        });
    });

    describe('when processing an update request', function() {
        const existingVersionTag = uuid.v4();
        const existingUpdatedDate = new Date(2016, 11, 5);

        beforeEach(function() {
            const correlationIdOptions = config.get('logging').correlationId;
            const reqOptions = {
                method: 'POST',
                url: '/user',
                headers: {},
                user: {
                    _id: '256'
                },
                body: {
                    versionInfo: {
                        versionTag: existingVersionTag,
                        requestId: 'olduniquerequestid',
                        lastUpdatedBy: '333',
                        dateUpdated: existingUpdatedDate
                    }
                }
            };
            reqOptions.headers[correlationIdOptions.reqHeader] = 'uniquerequestid';
            request = httpMocks.createRequest(reqOptions);

            versionMiddleware.update(request, response, function() {
                return null;
            });
        });

        it('should set the request id in the body', function() {
            expect(request.body.versionInfo.updatedByRequestId).to.equal('uniquerequestid');
        });

        it('should update the date updated to a new date', function() {
            expect(request.body.versionInfo.dateUpdated).to.not.equal(existingUpdatedDate);
            expect(request.body.versionInfo.dateUpdated).to.be.a('date');
        });

        it('should update the version tag, to a new uuid', function() {
            expect(validUUIDRegexPattern.test(request.body.versionInfo.versionTag)).to.not.equal(existingVersionTag);
            expect(validUUIDRegexPattern.test(request.body.versionInfo.versionTag)).to.equal(true);
        });

        it('should set the update by field to the user id', function() {
            expect(request.body.versionInfo.lastUpdatedBy).to.equal('256');
        });
    });
});
