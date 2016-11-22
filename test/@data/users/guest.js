'use strict';
var ObjectId = require('mongodb').ObjectId;
var bcrypt = require('bcrypt');
var config = require('nconf');
var moment = require('moment');
var uuid = require("node-uuid");
var permissions = require('../../../src/permissions');
module.exports = function (callback) {
    var guestUser = config.get('tests').guestUser;
    var adminUser = config.get('tests').adminUser;
    bcrypt.hash(guestUser.password, config.get('authenticationOptions').password.saltRounds, hashCalculated);

    function hashCalculated(hashErr, hash) {
        if (hashErr) {
            return callback(hashErr);
        }
        var now = moment.utc().toDate();
        var user = {
            _id: ObjectId(guestUser._id),
            email: guestUser.email,
            firstName: 'Ryan',
            surname: 'Kotzen',
            passwordHash: hash,
            versionInfo: {
                dateCreated: now,
                versionTag: uuid.v4(),
                dateUpdated: now,
                createdBy: ObjectId(adminUser._id),
                lastUpdatedBy: ObjectId(adminUser._id)
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
        permissions.nodeAcl.addUserRoles(user._id.toString(), 'guest', function (addRoleErr) {
            return callback(addRoleErr, user);
        });
    }
};
