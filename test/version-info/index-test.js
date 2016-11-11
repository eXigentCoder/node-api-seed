require('../@util/init.js');
var httpMocks = require('node-mocks-http');
var uuid = require('node-uuid');
var versionMiddleware = require('../../src/version-info');

describe('when setting the version info of requests', function() {
    var request
    var response;
    var validUUIDRegexPattern = new RegExp(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/, 'i');

    beforeEach(function() {
        response = httpMocks.createResponse();
    });

    describe('when processing an add request', function () {
        beforeEach(function() {
            request = httpMocks.createRequest({
                method: 'POST',
                url: '/user',
                headers: {
                    "X-Request-Id": "uniquerequestid"
                },
                user: {
                    _id: '333'
                },
                body: {}
            });

            versionMiddleware.add(request, response, function () {});
        });

        it('should set the request id in the body', function () {
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
        var existingVersionTag = uuid.v4();
        var existingUpdatedDate = new Date(2016, 11, 5);

        beforeEach(function() {
            request = httpMocks.createRequest({
                method: 'POST',
                url: '/user',
                headers: {
                    "X-Request-Id": "uniquerequestid"
                },
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
            });

            versionMiddleware.update(request, response, function () {});
        });

        it('should set the request id in the body', function () {
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

