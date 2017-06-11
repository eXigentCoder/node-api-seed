'use strict';
const uuid = require('node-uuid');
const moment = require('moment');
const config = require('nconf');

module.exports = {
    add,
    update,
    addVersionInfoToObject,
    updateVersionInfoOnObject
};

function add(req, res, next) {
    const correlationIdOptions = config.get('logging').correlationId;
    addVersionInfoToObject(req.body, req.user, req.get(correlationIdOptions.reqHeader));
    return next();
}

function addVersionInfoToObject(object, user, requestId) {
    object.versionInfo = {
        dateCreated: moment.utc().toDate(),
        versionTag: uuid.v4(),
        dateUpdated: moment.utc().toDate(),
        createdBy: user._id,
        lastUpdatedBy: user._id,
        updatedByRequestId: requestId
    };
}

function update(req, res, next) {
    const correlationIdOptions = config.get('logging').correlationId;
    updateVersionInfoOnObject(req.body, req.user, req.get(correlationIdOptions.reqHeader));
    next();
}

function updateVersionInfoOnObject(object, user, requestId) {
    object.versionInfo.versionTag = uuid.v4();
    object.versionInfo.dateUpdated = moment.utc().toDate();
    object.versionInfo.lastUpdatedBy = user._id;
    object.versionInfo.updatedByRequestId = requestId;
}
