'use strict';
var common = require('../../@util/integration-common.js');
var router = require('../../../src/routes/users/index.js');

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
        it('No Authentication', function (done) {
            common.request.get('/users/:email')
                .use(common.urlTemplate({"email":"580d9f45622d510b044fb6a8"}))
                .expect(common.error(401))
                .expect(common.matchesSwaggerSchema)
                .end(common.logResponse(done));
        });
        it('Invalid path parameter', function (done) {
            common.request.get('/users/:email')
                .use(common.urlTemplate({"email":"9479210c-a874-4521-870f-bb2d2792bb0d"}))
                .set(common.authentication())
                .expect(common.error(404))
                .expect(common.matchesSwaggerSchema)
                .end(common.logResponse(done));
        });
    });
    describe('Posts Through An User To Be Created.', function () {
        it('Happy case', function (done) {
            common.request.post('/users')
                .send(common.generateDataFromSchema(router.metadata.schemas.creation))
                .set(common.authentication())
                .expect(common.success(201))
                .expect(common.matchesSwaggerSchema)
                .end(common.logResponse(done));
        });
        it('No Authentication', function (done) {
            common.request.post('/users')
                .send(common.generateDataFromSchema(router.metadata.schemas.creation))
                .expect(common.error(401))
                .expect(common.matchesSwaggerSchema)
                .end(common.logResponse(done));
        });
        it('No Data', function (done) {
            common.request.post('/users')
                .send({})
                .set(common.authentication())
                .expect(common.error(400))
                .expect(common.matchesSwaggerSchema)
                .end(common.logResponse(done));
        });
    });
    describe('Updates a User By Email', function () {
        //update
    });
    describe('Updates the status of a User By Email', function () {
        //update status
    });
});
