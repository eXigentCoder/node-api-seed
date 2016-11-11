'use strict';
var getOptionsWithDefaults = require('request-id/defaults');
var requestId = require('request-id/express');
var config = require('nconf');

module.exports = function configureRequestId(app) {
    var requestIdOptions = getRequestIdOptions();
    app.use(requestId(requestIdOptions));
    app.use(function (req, res, next) {
        req.headers[requestIdOptions.reqHeader.toLowerCase()] = req[requestIdOptions.paramName];
        return next();
    });
};

function getRequestIdOptions() {
    var requestIdOptions = config.get('logging').correlationId || {};
    requestIdOptions = getOptionsWithDefaults(requestIdOptions);
    return requestIdOptions;
}
module.exports.getRequestIdOptions = getRequestIdOptions;