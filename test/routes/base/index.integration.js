'use strict';
var common = require('../../@util/integration-common');
/* ----========[ end of test file setup ]========---- */

describe('Root', function () {
    this.timeout(common.defaultTimeout);
    it('Get', function (done) {
        common.request.get('/')
            .expect(200)
            .expect(common.success)
            .expect(common.matchesSwaggerSchema)
            .end(done);
    });
});