'use strict';
var common = require('../../../@util/integration-common.js');
var router = require('../../../../src/routes/users/items/index.js');
var config = require('nconf');

describe('Items', function () {
    this.timeout(common.defaultTimeout);
    describe('Search for Items', function () {
        it('Happy case', function (done) {
            common.request.get('/users/:email/items')
                .use(common.urlTemplate({"email": "580d9f45622d510b044fb6a8"}))
                .set(common.authentication({user: config.get('tests').adminUser}))
                .expect(common.success(200))
                .expect(common.matchesSwaggerSchema)
                .expect(common.hasResults)
                .end(common.logResponse(done));
        });
        it('No Authentication', function (done) {
            common.request.get('/users/:email/items')
                .use(common.urlTemplate({"email": "580d9f45622d510b044fb6a8"}))
                .expect(common.error(401))
                .expect(common.matchesSwaggerSchema)
                .end(common.logResponse(done));
        });
        it('No guest access', function (done) {
            common.request.get('/users/:email/items')
                .use(common.urlTemplate({"email": "580d9f45622d510b044fb6a8"}))
                .set(common.authentication({user: config.get('tests').guestUser}))
                .expect(common.error(403))
                .expect(common.matchesSwaggerSchema)
                .end(common.logResponse(done));
        });
        it('Normal users can search items', function (done) {
            common.request.get('/users/:email/items')
                .use(common.urlTemplate({"email": "580d9f45622d510b044fb6a8"}))
                .set(common.authentication({user: config.get('tests').normalUser}))
                .expect(common.success(200))
                .expect(common.matchesSwaggerSchema)
                .expect(common.hasResults)
                .end(common.logResponse(done));
        });
    });

    describe('Get Item By Name.', function () {
        it('Happy case', function (done) {
            common.request.get('/users/:email/items/:name')
                .use(common.urlTemplate({"name": "item1", "email": "580d9f45622d510b044fb6a8"}))
                .set(common.authentication({user: config.get('tests').adminUser}))
                .expect(common.success(200))
                .expect(common.matchesSwaggerSchema)
                .end(common.logResponse(done));
        });
        it('No Authentication', function (done) {
            common.request.get('/users/:email/items/:name')
                .use(common.urlTemplate({"name": "item1", "email": "580d9f45622d510b044fb6a8"}))
                .expect(common.error(401))
                .expect(common.matchesSwaggerSchema)
                .end(common.logResponse(done));
        });
        it('Invalid path parameter', function (done) {
            common.request.get('/users/:email/items/:name')
                .use(common.urlTemplate({"name": "28f2c035-ca2e-48aa-bca4-79c4e17b5d80", "email": "25459faf-99be-41a6-8653-c3b839116612"}))
                .set(common.authentication({user: config.get('tests').adminUser}))
                .expect(common.error(404))
                .expect(common.matchesSwaggerSchema)
                .end(common.logResponse(done));
        });
        it('No guest access', function (done) {
            common.request.get('/users/:email/items/:name')
                .use(common.urlTemplate({"name": "item1", "email": "580d9f45622d510b044fb6a8"}))
                .set(common.authentication({user: config.get('tests').guestUser}))
                .expect(common.error(403))
                .expect(common.matchesSwaggerSchema)
                .end(common.logResponse(done));
        });
    });

    describe('Posts Through An Item To Be Created.', function () {
        it('Happy case', function (done) {
            common.request.post('/users/:email/items')
                .use(common.urlTemplate({"email": "580d9f45622d510b044fb6a8"}))
                .send(common.generateDataFromSchema(router.metadata.schemas.creation))
                .set(common.authentication({user: config.get('tests').adminUser}))
                .expect(common.success(201))
                .expect(common.matchesSwaggerSchema)
                .end(common.logResponse(done));
        });
        it('No Authentication', function (done) {
            common.request.post('/users/:email/items')
                .use(common.urlTemplate({"email": "580d9f45622d510b044fb6a8"}))
                .send(common.generateDataFromSchema(router.metadata.schemas.creation))
                .expect(common.error(401))
                .expect(common.matchesSwaggerSchema)
                .end(common.logResponse(done));
        });
        it('No Data', function (done) {
            common.request.post('/users/:email/items')
                .use(common.urlTemplate({"email": "580d9f45622d510b044fb6a8"}))
                .send({})
                .set(common.authentication({user: config.get('tests').adminUser}))
                .expect(common.error(400))
                .expect(common.matchesSwaggerSchema)
                .end(common.logResponse(done));
        });
        it('No guest access', function (done) {
            common.request.post('/users/:email/items')
                .use(common.urlTemplate({"email": "580d9f45622d510b044fb6a8"}))
                .set(common.authentication({user: config.get('tests').guestUser}))
                .send(common.generateDataFromSchema(router.metadata.schemas.creation))
                .expect(common.error(403))
                .expect(common.matchesSwaggerSchema)
                .end(common.logResponse(done));
        });
    });

    describe('Updates An Item By Name', function () {
        it('Happy case', function (done) {
            common.request.put('/users/:email/items/:name')
                .use(common.urlTemplate({"name": "item1", "email": "580d9f45622d510b044fb6a8"}))
                .send(common.generateDataFromSchema(router.metadata.schemas.update))
                .set(common.authentication({user: config.get('tests').adminUser}))
                .expect(common.success(204))
                .end(common.logResponse(done));
        });
        it('No Authentication', function (done) {
            common.request.put('/users/:email/items/:name')
                .use(common.urlTemplate({"name": "item1", "email": "580d9f45622d510b044fb6a8"}))
                .send(common.generateDataFromSchema(router.metadata.schemas.update))
                .expect(common.error(401))
                .end(common.logResponse(done));
        });
        it('No Data', function (done) {
            common.request.put('/users/:email/items/:name')
                .use(common.urlTemplate({"name": "item1", "email": "580d9f45622d510b044fb6a8"}))
                .send({})
                .set(common.authentication({user: config.get('tests').adminUser}))
                .expect(common.error(400))
                .end(common.logResponse(done));
        });
        it('No guest access', function (done) {
            common.request.put('/users/:email/items/:name')
                .use(common.urlTemplate({"name": "item1", "email": "580d9f45622d510b044fb6a8"}))
                .set(common.authentication({user: config.get('tests').guestUser}))
                .send(common.generateDataFromSchema(router.metadata.schemas.update))
                .expect(common.error(403))
                .end(common.logResponse(done));
        });
    });

    describe('Removes An Item By Name.', function () {
        it('Happy case', function (done) {
            common.request.delete('/users/:email/items/:name')
                .use(common.urlTemplate({"name": "item3", "email": "580d9f45622d510b044fb6a8"}))
                .set(common.authentication({user: config.get('tests').adminUser}))
                .expect(common.success(204))
                .end(common.logResponse(done));
        });
        it('No Authentication', function (done) {
            common.request.delete('/users/:email/items/:name')
                .use(common.urlTemplate({"name": "item3", "email": "580d9f45622d510b044fb6a8"}))
                .expect(common.error(401))
                .expect(common.matchesSwaggerSchema)
                .end(common.logResponse(done));
        });
        it('Invalid path parameter', function (done) {
            common.request.delete('/users/:email/items/:name')
                .use(common.urlTemplate({"name": "7b7c0077-3b0f-41b4-92b8-30f7492fd510", "email": "805bb305-7af7-4941-bd8c-a50df72cd8da"}))
                .set(common.authentication({user: config.get('tests').adminUser}))
                .expect(common.error(404))
                .expect(common.matchesSwaggerSchema)
                .end(common.logResponse(done));
        });
        it('No guest access', function (done) {
            common.request.delete('/users/:email/items/:name')
                .use(common.urlTemplate({"name": "item3", "email": "580d9f45622d510b044fb6a8"}))
                .set(common.authentication({user: config.get('tests').guestUser}))
                .expect(common.error(403))
                .expect(common.matchesSwaggerSchema)
                .end(common.logResponse(done));
        });
    });
});
