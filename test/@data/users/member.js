'use strict';
var ObjectId = require('mongodb').ObjectId;
var bcrypt = require('bcrypt');
var config = require('nconf');
var moment = require('moment');
var uuid = require("node-uuid");
var permissions = require('../../../src/permissions');
module.exports = function (callback) {
    var normalUser = config.get('tests').normalUser;
    var adminUser = config.get('tests').adminUser;
    bcrypt.hash(normalUser.password, config.get('authenticationOptions').password.saltRounds, hashCalculated);

    function hashCalculated(hashErr, hash) {
        if (hashErr) {
            return callback(hashErr);
        }
        var now = moment.utc().toDate();
        var user = {
            _id: ObjectId(normalUser._id),
            email: normalUser.email,
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
        permissions.nodeAcl.addUserRoles(user._id.toString(), 'member', function (addRoleErr) {
            return callback(addRoleErr, user);
        });
    }
};
