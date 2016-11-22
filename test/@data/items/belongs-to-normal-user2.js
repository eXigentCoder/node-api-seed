'use strict';
var ObjectId = require('mongodb').ObjectId;
var moment = require('moment');
var uuid = require("node-uuid");
var config = require('nconf');

module.exports = function (callback) {
    var normalUser = config.get('tests').normalUser;
    var now = moment.utc().toDate();
    var userId = ObjectId(normalUser._id);
    var item = {
        name: 'item6',
        description: 'Really cool item belonging to default.',
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