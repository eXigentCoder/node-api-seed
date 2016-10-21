'use strict';
require('./init.js');
/* ----========[ end of test file setup ]========---- */

describe('#Basic Unit Test', function () {
    it('1. 1 = 1', function () {
        var one = 1;
        one.should.equal(1);
    });
});