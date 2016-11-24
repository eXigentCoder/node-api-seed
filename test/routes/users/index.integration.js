'use strict';
var common = require('../../@util/integration-common.js');
var router = require('../../../src/routes/users/index.js');
var config = require('nconf');

describe('Users', function () {
    this.timeout(common.defaultTimeout);
    describe('Search for Users', function () {
        it('Happy case', function (done) {
            common.request.get('/users')
                .set(common.authentication({user: config.get('tests').adminUser}))
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
                .use(common.urlTemplate({email: config.get('tests').adminUser._id}))
                .set(common.authentication({user: config.get('tests').adminUser}))
                .expect(common.success(200))
                .expect(common.matchesSwaggerSchema)
                .end(common.logResponse(done));
        });
        it('No Authentication', function (done) {
            common.request.get('/users/:email')
                .use(common.urlTemplate({email: config.get('tests').adminUser._id}))
                .expect(common.error(401))
                .expect(common.matchesSwaggerSchema)
                .end(common.logResponse(done));
        });
        it('Invalid path parameter', function (done) {
            common.request.get('/users/:email')
                .use(common.urlTemplate({"email": "2b8934a4-82ee-4cae-9ce8-0e3379254e4d"}))
                .set(common.authentication({user: config.get('tests').adminUser}))
                .expect(common.error(404))
                .expect(common.matchesSwaggerSchema)
                .end(common.logResponse(done));
        });
    });

    describe('Posts Through An User To Be Created.', function () {
        it('Happy case', function (done) {
            common.request.post('/users')
                .send(common.generateDataFromSchema(router.metadata.schemas.creation))
                .set(common.authentication({user: config.get('tests').adminUser}))
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
                .set(common.authentication({user: config.get('tests').adminUser}))
                .expect(common.error(400))
                .expect(common.matchesSwaggerSchema)
                .end(common.logResponse(done));
        });
    });

    describe('Updates a User By Email', function () {
        it('Happy case', function (done) {
            common.request.put('/users/:email')
                .use(common.urlTemplate({email: config.get('tests').adminUser._id}))
                .send(common.generateDataFromSchema(router.metadata.schemas.update))
                .set(common.authentication({user: config.get('tests').adminUser}))
                .expect(common.success(204))
                .end(common.logResponse(done));
        });
        it('No Authentication', function (done) {
            common.request.put('/users/:email')
                .use(common.urlTemplate({email: config.get('tests').adminUser._id}))
                .send(common.generateDataFromSchema(router.metadata.schemas.update))
                .expect(common.error(401))
                .end(common.logResponse(done));
        });
        it('No Data', function (done) {
            common.request.put('/users/:email')
                .use(common.urlTemplate({email: config.get('tests').adminUser._id}))
                .send({})
                .set(common.authentication({user: config.get('tests').adminUser}))
                .expect(common.error(400))
                .end(common.logResponse(done));
        });
    });

    describe('Updates the status of a User By Email', function () {
        it('Happy case', function (done) {
            common.request.put('/users/:email/:newStatusName')
                .use(common.urlTemplate({email: config.get('tests').adminUser._id, "newStatusName": "testStatus"}))
                .send(common.generateDataFromSchema(router.metadata.schemas.updateStatus))
                .set(common.authentication({user: config.get('tests').adminUser}))
                .expect(common.success(204))
                .end(common.logResponse(done));
        });
        it('No Authentication', function (done) {
            common.request.put('/users/:email/:newStatusName')
                .use(common.urlTemplate({email: config.get('tests').adminUser._id, "newStatusName": "testStatus"}))
                .send(common.generateDataFromSchema(router.metadata.schemas.updateStatus))
                .expect(common.error(401))
                .end(common.logResponse(done));
        });
        it('No Data', function (done) {
            common.request.put('/users/:email/:newStatusName')
                .use(common.urlTemplate({email: config.get('tests').adminUser._id, "newStatusName": "testStatus"}))
                .send({})
                .set(common.authentication({user: config.get('tests').adminUser}))
                .expect(common.error(400))
                .end(common.logResponse(done));
        });
    });
});
