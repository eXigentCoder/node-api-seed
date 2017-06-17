const ObjectId = require('mongodb').ObjectId;
const moment = require('moment');
const uuid = require('node-uuid');

const now = moment.utc().toDate();
const userId = ObjectId('580d9f45622d510b044fb6a8');
module.exports = {
    name: 'item2',
    description: 'Really cool item, that does not belong to default.',
    owner: userId,
    ownerDate: now,
    ownerLog: [
        {
            owner: userId,
            data: {
                reason: 'testing'
            },
            ownerDate: now
        }
    ],
    versionInfo: {
        dateCreated: now,
        versionTag: uuid.v4(),
        dateUpdated: now,
        createdBy: userId,
        lastUpdatedBy: userId
    }
};
