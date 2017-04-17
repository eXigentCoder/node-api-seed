'use strict';
const uuid = require('node-uuid');
const moment = require('moment');
const config = require('nconf');

module.exports = {
    add: add,
    update: update
};

function add(req, res, next) {
    const correlationIdOptions = config.get('logging').correlationId;
    req.body.versionInfo = {
        dateCreated: moment.utc().toDate(),
        versionTag: uuid.v4(),
        dateUpdated: moment.utc().toDate(),
        createdBy: req.user._id,
        lastUpdatedBy: req.user._id,
        updatedByRequestId: req.get(correlationIdOptions.reqHeader)
    };
    return next();
}

function update(req, res, next) {
    const correlationIdOptions = config.get('logging').correlationId;
    req.body.versionInfo.versionTag = uuid.v4();
    req.body.versionInfo.dateUpdated = moment.utc().toDate();
    req.body.versionInfo.lastUpdatedBy = req.user._id;
    req.body.versionInfo.updatedByRequestId = req.get(correlationIdOptions.reqHeader);
    next();
}