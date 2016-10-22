'use strict';
var common = require('../../@util/integration-common');
/* ----========[ end of test file setup ]========---- */
var uncaughtErrorMessage = require('../../../src/routes/test-errors')._uncaughtErrorMessage;

describe('Test errors', function () {
    this.timeout(common.defaultTimeout);
    it('server', function (done) {
        common.request.get('/error/server')
            .set(common.requestHeaders)
            .expect(common.error(500))
            .end(done);
    });
    it('client', function (done) {
        common.request.get('/error/client')
            .set(common.requestHeaders)
            .expect(common.error(400))
            .end(done);
    });
    it('process', function (done) {
        var listners = process.listeners('uncaughtException');
        process.removeAllListeners(["uncaughtException"]);
        process.once("uncaughtException", function (error) {
            listners.forEach(function (listner) {
                process.listeners('uncaughtException').push(listner);
            });
            expect(error).to.be.ok();
            expect(error.message).to.equal(uncaughtErrorMessage);
            done();
        });
        common.request.get('/error/process')
            .set(common.requestHeaders)
            .expect(common.error)
            .end(function () {
                done(new Error('Should not have got here'));
            });

    });
});