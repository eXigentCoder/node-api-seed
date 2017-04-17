'use strict';
const common = require('../../@util/integration-common.js');
const config = require('nconf');

describe('Authentication', function() {
    describe('login', function() {
        it('should return a success response if the details are correct', done => {
            const username = config.get('tests').adminUser.email;
            const password = config.get('tests').adminUser.password;

            common.request.post('/authentication/login')
                .send({ username: username, password: password })
                .expect(common.success(200))
                .end(common.logResponse(done));
        });

        it('should return a 401 response if the details are wrong', done => {
            common.request.post('/authentication/login')
                .send({ username: 'wrong', password: 'wrong' })
                .expect(common.error(401))
                .end(common.logResponse(done));
        });
    });
});