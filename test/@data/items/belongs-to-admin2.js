'use strict';
const ObjectId = require('mongodb').ObjectId;
const moment = require('moment');
const uuid = require("node-uuid");
const config = require('nconf');

module.exports = function (callback) {
    const adminUser = config.get('tests').adminUser;
    const now = moment.utc().toDate();
    const userId = ObjectId(adminUser._id);
    const item = {
        name: 'item5',
        description: 'Really cool item belonging to default.',
        owner: userId,
        ownerDate: now,
        ownerLog: [{
            owner: userId,
            data: {
                reason: "testing"
            },
            ownerDate: now
        }],
        versionInfo: {
            dateCreated: now,
            versionTag: uuid.v4(),
            dateUpdated: now,
            createdBy: userId,
            lastUpdatedBy: userId
        }
    };
    return callback(null, item);
};