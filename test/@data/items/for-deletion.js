'use strict';
var ObjectId = require('mongodb').ObjectId;
var moment = require('moment');
var uuid = require("node-uuid");

module.exports = {
    name: 'item3',
    description: 'Really cool item, that is about to be deleted',
    owner: ObjectId('580d9f45622d510b044fb6a8'),
    versionInfo: {
        dateCreated: moment.utc().toDate(),
        versionTag: uuid.v4(),
        dateUpdated: moment.utc().toDate(),
        createdBy: ObjectId("580d9f45622d510b044fb6a8"),
        lastUpdatedBy: ObjectId("580d9f45622d510b044fb6a8")
    }
};