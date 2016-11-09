'use strict';
var uuid = require('node-uuid');
var moment = require('moment');
module.exports = {
    add: add,
    update: update
};

function add(req, res, next) {
    req.body.versionInfo = {
        dateCreated: moment.utc().toDate(),
        versionTag: uuid.v4(),
        dateUpdated: moment.utc().toDate(),
        createdBy: req.user._id,
        lastUpdatedBy: req.user._id
    };
    return next();
}

function update(req, res, next) {
    req.body.versionInfo.versionTag = uuid.v4();
    req.body.versionInfo.dateUpdated = moment.utc().toDate();
    req.body.versionInfo.lastUpdatedBy = req.user._id;
    next();
}
