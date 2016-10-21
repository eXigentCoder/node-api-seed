'use strict';
var common = require('./integration-common');
/* ----========[ end of test file setup ]========---- */

describe('#Basic Integration Test', function () {
    it('1. Get root', function (done) {
        common.request
            .get('/')
            .expect(200)
            .end(function (err, res) {
                console.log(err);
                console.log(res.body);
                done();
            });
    });
});