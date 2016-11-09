'use strict';
var ObjectId = require('mongodb').ObjectId;
var bcrypt = require('bcrypt');
var config = require('nconf');
var authentication = require('../../../src/authentication');
module.exports = function (callback) {
    var defaultUser = config.get('tests').defaultUser;
    bcrypt.hash(defaultUser.password, config.get('authenticationOptions').password.saltRounds, hashCalculated);

    function hashCalculated(err, hash) {
        if (err) {
            return callback(err);
        }
        var user = {
            _id: ObjectId('580d9f45622d510b044fb6a8'),
            email: defaultUser.email,
            firstName: 'Ryan',
            surname: 'Kotzen',
            passwordHash: hash
        };
        config.set('defaultUserAuthToken', authentication.getUserToken(user));
        return callback(null, user);
    }
};