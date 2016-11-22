'use strict';
var ObjectId = require('mongodb').ObjectId;
var moment = require('moment');
var uuid = require("node-uuid");

var now = moment.utc().toDate();
var userId = ObjectId('580d9f45622d510b044fb6a8');
module.exports = {
    name: 'item1',
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