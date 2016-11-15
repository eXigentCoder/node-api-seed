'use strict';
var ObjectId = require('mongodb').ObjectId;
var bcrypt = require('bcrypt');
var config = require('nconf');
var authentication = require('../../../src/authentication');
var moment = require('moment');
var uuid = require("node-uuid");

module.exports = function (callback) {
    var defaultUser = config.get('tests').defaultUser;
    bcrypt.hash(defaultUser.password, config.get('authenticationOptions').password.saltRounds, hashCalculated);

    function hashCalculated(err, hash) {
        if (err) {
            return callback(err);
        }
        var user = {
            _id: ObjectId(defaultUser._id),
            email: defaultUser.email,
            firstName: 'Ryan',
            surname: 'Kotzen',
            passwordHash: hash,
            versionInfo: {
                dateCreated: moment.utc().toDate(),
                versionTag: uuid.v4(),
                dateUpdated: moment.utc().toDate(),
                createdBy: ObjectId("580d9f45622d510b044fb6a8"),
                lastUpdatedBy: ObjectId("580d9f45622d510b044fb6a8")
            }
        };
        config.set('defaultUserAuthToken', authentication.getUserToken(user));
        return callback(null, user);
    }
};