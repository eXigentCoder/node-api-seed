'use strict';
const ObjectId = require('mongodb').ObjectId;
const bcrypt = require('bcrypt');
const config = require('nconf');
const moment = require('moment');
const uuid = require('node-uuid');
const permissions = require('../../../src/permissions');
module.exports = function(callback) {
    const adminUser = config.get('tests').adminUser;
    bcrypt.hash(
        adminUser.password,
        config.get('authenticationOptions').password.saltRounds,
        hashCalculated
    );

    function hashCalculated(hashErr, hash) {
        if (hashErr) {
            return callback(hashErr);
        }
        const now = moment.utc().toDate();
        const user = {
            _id: ObjectId(adminUser._id),
            email: adminUser.email,
            firstName: 'Ryan',
            surname: 'Kotzen',
            passwordHash: hash,
            versionInfo: {
                dateCreated: now,
                versionTag: uuid.v4(),
                dateUpdated: now,
                createdBy: ObjectId('580d9f45622d510b044fb6a8'),
                lastUpdatedBy: ObjectId('580d9f45622d510b044fb6a8')
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
        permissions.nodeAcl.addUserRoles(user._id.toString(), 'admin', function(addRoleErr) {
            return callback(addRoleErr, user);
        });
    }
};
