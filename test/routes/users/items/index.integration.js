'use strict';
var common = require('../../../@util/integration-common.js');
var router = require('../../../../src/routes/users/items/index.js');

describe('Items', function () {
    this.timeout(common.defaultTimeout);
    describe('Search for Items', function () {
        it('Happy case', function (done) {
            common.request.get('/users/:email/items')
                .use(common.urlTemplate({"email":"580d9f45622d510b044fb6a8"}))
                .set(common.authentication())
                .expect(common.success(200))
                .expect(common.matchesSwaggerSchema)
                .expect(common.hasResults)
                .end(common.logResponse(done));
        });
        it('No Authentication', function (done) {
            common.request.get('/users/:email/items')
                .use(common.urlTemplate({"email":"580d9f45622d510b044fb6a8"}))
                .expect(common.error(401))
                .expect(common.matchesSwaggerSchema)
                .end(common.logResponse(done));
        });
    });
    
    describe('Get Item By Name.', function () {
        it('Happy case', function (done) {
            common.request.get('/users/:email/items/:name')
                .use(common.urlTemplate({"name":"item1","email":"580d9f45622d510b044fb6a8"}))
                .set(common.authentication())
                .expect(common.success(200))
                .expect(common.matchesSwaggerSchema)
                .end(common.logResponse(done));
        });
        it('No Authentication', function (done) {
            common.request.get('/users/:email/items/:name')
                .use(common.urlTemplate({"name":"item1","email":"580d9f45622d510b044fb6a8"}))
                .expect(common.error(401))
                .expect(common.matchesSwaggerSchema)
                .end(common.logResponse(done));
        });
        it('Invalid path parameter', function (done) {
            common.request.get('/users/:email/items/:name')
                .use(common.urlTemplate({"name":"849b266b-81de-4166-be7e-d31809d2206a","email":"2e8fa795-7d0c-48b0-ab0f-95e5f509757d"}))
                .set(common.authentication())
                .expect(common.error(404))
                .expect(common.matchesSwaggerSchema)
                .end(common.logResponse(done));
        });
    });
    
    describe('Posts Through An Item To Be Created.', function () {
        it('Happy case', function (done) {
            common.request.post('/users/:email/items')
                .use(common.urlTemplate({"email":"580d9f45622d510b044fb6a8"}))
                .send(common.generateDataFromSchema(router.metadata.schemas.creation))
                .set(common.authentication())
                .expect(common.success(201))
                .expect(common.matchesSwaggerSchema)
                .end(common.logResponse(done));
        });
        it('No Authentication', function (done) {
            common.request.post('/users/:email/items')
                .use(common.urlTemplate({"email":"580d9f45622d510b044fb6a8"}))
                .send(common.generateDataFromSchema(router.metadata.schemas.creation))
                .expect(common.error(401))
                .expect(common.matchesSwaggerSchema)
                .end(common.logResponse(done));
        });
        it('No Data', function (done) {
            common.request.post('/users/:email/items')
                .use(common.urlTemplate({"email":"580d9f45622d510b044fb6a8"}))
                .send({})
                .set(common.authentication())
                .expect(common.error(400))
                .expect(common.matchesSwaggerSchema)
                .end(common.logResponse(done));
        });
    });
    
    describe('Updates a Item By Name', function () {
        it('Happy case', function (done) {
            common.request.put('/users/:email/items/:name')
                .use(common.urlTemplate({"name":"item1","email":"580d9f45622d510b044fb6a8"}))
                .use(common.urlTemplate({"name":"item1","email":"580d9f45622d510b044fb6a8"}))
                .send(common.generateDataFromSchema(router.metadata.schemas.update))
                .set(common.authentication())
                .expect(common.success(204))
                .end(common.logResponse(done));
        });
        it('No Authentication', function (done) {
            common.request.put('/users/:email/items/:name')
                .use(common.urlTemplate({"name":"item1","email":"580d9f45622d510b044fb6a8"}))
                .send(common.generateDataFromSchema(router.metadata.schemas.update))
                .expect(common.error(401))
                .end(common.logResponse(done));
        });
        it('No Data', function (done) {
            common.request.put('/users/:email/items/:name')
                .use(common.urlTemplate({"name":"item1","email":"580d9f45622d510b044fb6a8"}))
                .send({})
                .set(common.authentication())
                .expect(common.error(400))
                .end(common.logResponse(done));
        });
    });
});
