'use strict';
const common = require('../../@util/integration-common');
const uncaughtErrorMessage = require('../../../src/routes/test-errors')._uncaughtErrorMessage;
const config = require('nconf');

describe('Test errors', function() {
    this.timeout(common.defaultTimeout);
    it('server', function(done) {
        common.request
            .get('/error/server')
            .set(common.authentication({ user: config.get('tests').adminUser }))
            .expect(common.error(500))
            .end(done);
    });
    it('client', function(done) {
        common.request
            .get('/error/client')
            .set(common.authentication({ user: config.get('tests').adminUser }))
            .expect(common.error(400))
            .end(done);
    });
    it('process', function(done) {
        const listners = process.listeners('uncaughtException');
        process.removeAllListeners(['uncaughtException']);
        process.once('uncaughtException', function(error) {
            listners.forEach(function(listner) {
                process.listeners('uncaughtException').push(listner);
            });
            expect(error).to.be.ok();
            expect(error.message).to.equal(uncaughtErrorMessage);
            done();
        });
        common.request
            .get('/error/process')
            .set(common.authentication({ user: config.get('tests').adminUser }))
            .expect(common.error)
            .end(function() {
                done(new Error('Should not have got here'));
            });
    });
});
