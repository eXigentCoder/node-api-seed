'use strict';
var common = require('../../@util/integration-common.js');
describe('Users', function () {
    this.timeout(common.defaultTimeout);
    describe('Search for Users', function () {
        it('Happy case', function (done) {
            common.request.get('/users')
                .expect(common.success(200))
                .set(common.authentication())
                .expect(common.matchesSwaggerSchema)
                .end(done);
        });
    });
    describe('Get User By Email.', function () {
        //getById
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
