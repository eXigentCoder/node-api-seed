'use strict';
var ObjectId = require('mongodb').ObjectId;
var moment = require('moment');
var uuid = require("node-uuid");
var config = require('nconf');

module.exports = function (callback) {
    var adminUser = config.get('tests').adminUser;
    var now = moment.utc().toDate();
    var userId = ObjectId(adminUser._id);
    var item = {
        name: 'item3',
        description: 'Really cool item, that is about to be deleted',
        owner: userId,
        ownerDate: now,
        ownerLog: [{
            owner: userId,
            data: null,
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