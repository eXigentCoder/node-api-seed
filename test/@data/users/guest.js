'use strict';
const ObjectId = require('mongodb').ObjectId;
const bcrypt = require('bcrypt');
const config = require('nconf');
const moment = require('moment');
const uuid = require('node-uuid');
const permissions = require('../../../src/permissions');
module.exports = function(callback) {
    const guestUser = config.get('tests').guestUser;
    const adminUser = config.get('tests').adminUser;
    bcrypt.hash(
        guestUser.password,
        config.get('authenticationOptions').password.saltRounds,
        hashCalculated
    );

    function hashCalculated(hashErr, hash) {
        if (hashErr) {
            return callback(hashErr);
        }
        const now = moment.utc().toDate();
        const user = {
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
            status: 'active',
            statusDate: now,
            statusLog: [
                {
                    status: 'active',
                    data: {
                        reason: 'testing'
                    },
                    statusDate: now
                }
            ]
        };
        permissions.nodeAcl.addUserRoles(user._id.toString(), 'guest', function(addRoleErr) {
            return callback(addRoleErr, user);
        });
    }
};
