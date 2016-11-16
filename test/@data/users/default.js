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
        var now = moment.utc().toDate();
        var user = {
            _id: ObjectId(defaultUser._id),
            email: defaultUser.email,
            firstName: 'Ryan',
            surname: 'Kotzen',
            passwordHash: hash,
            role: 'member',
            versionInfo: {
                dateCreated: now,
                versionTag: uuid.v4(),
                dateUpdated: now,
                createdBy: ObjectId("580d9f45622d510b044fb6a8"),
                lastUpdatedBy: ObjectId("580d9f45622d510b044fb6a8")
            },
            status: "active",
            statusDate: now,
            statusLog: [
                {
                    status: "active",
                    data: {},
                    statusDate: now
                }
            ]
        };
        config.set('defaultUserAuthToken', authentication.getUserToken(user));
        return callback(null, user);
    }
};
