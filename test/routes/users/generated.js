'use strict';
var common = require('../../@util/integration-common.js');
describe('Users', function () {
    this.timeout(common.defaultTimeout);
    describe('Search for Users', function () {
        it('Happy case', function (done) {
            common.request.get('/users')
                .set(common.authentication())
                .expect(common.success(200))
                .expect(common.matchesSwaggerSchema)
                .expect(common.hasResults)
                .end(common.logResponse(done));
        });
        it('No Authentication', function (done) {
            common.request.get('/users')
                .expect(common.error(401))
                .expect(common.matchesSwaggerSchema)
                .end(common.logResponse(done));
        });
    });
    describe('Get User By Email.', function () {
        it('Happy case', function (done) {
            common.request.get('/users/:email')
                .use(common.urlTemplate({"email":"580d9f45622d510b044fb6a8"}))
                .set(common.authentication())
                .expect(common.success(200))
                .expect(common.matchesSwaggerSchema)
                .end(common.logResponse(done));
        });
        it('Invalid path parameter', function (done) {
            common.request.get('/users/:email')
                .use(common.urlTemplate({"email":"070cf33f-9532-40e9-915b-510080685924"}))
                .set(common.authentication())
                .expect(common.error(404))
                .expect(common.matchesSwaggerSchema)
                .end(common.logResponse(done));
        });
    });
    describe('Posts Through An User To Be Created.', function () {
        //create
    });
    describe('Updates a User By Email', function () {
        //update
    });
    describe('Updates the status of a User By Email', function () {
        //update status
    });
});
