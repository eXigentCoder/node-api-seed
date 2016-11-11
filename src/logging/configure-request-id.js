'use strict';
var requestId = require('request-id/express');
var config = require('nconf');

module.exports = function configureRequestId(app) {
    var correlationIdOptions = config.get('logging').correlationId;
    app.use(requestId(correlationIdOptions));
    app.use(function (req, res, next) {
        req.headers[correlationIdOptions.reqHeader.toLowerCase()] = req[correlationIdOptions.paramName];
        return next();
    });
};