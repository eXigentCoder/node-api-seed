'use strict';
var getOptionsWithDefaults = require('request-id/defaults');
var requestId = require('request-id/express');
var config = require('nconf');

module.exports = function configureRequestId(app) {
    var requestIdOptions = config.get('logging').requestId || {};
    requestIdOptions = getOptionsWithDefaults(requestIdOptions);
    app.use(requestId(requestIdOptions));
    app.use(function (req, res, next) {
        req.headers[requestIdOptions.reqHeader.toLowerCase()] = req.headers[requestIdOptions.reqHeader] || req[requestIdOptions.paramName];
        return next();
    });
};