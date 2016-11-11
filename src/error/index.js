'use strict';
var packageJson = require('../../package.json');
var boom = require('boom');
var _ = require('lodash');
var config = require('nconf');
var getRequestIdOptions = require('../logging/configure-request-id').getRequestIdOptions;

module.exports = {
    errorHandler: function (err, req, res, next) {
        if (err.isBoom) {
            return next(err);
        }
        var statusCode = err.statusCode || 500;
        if (_.isError(err)) {
            return next(boom.wrap(err, statusCode));
        }
        if (_.isString(err)) {
            return next(boom.create(statusCode, err));
        }
        return next(boom.create(statusCode, 'Error', err));
    },
    // eslint-disable-next-line no-unused-vars
    boomErrorHandler: function (err, req, res, next) {
        var requestIdOptions = getRequestIdOptions();
        var requestId = req[requestIdOptions.paramName] || 'unknown';
        if (err.isServer) {
            console.error('RequestId-' + requestId, 'Server Error :', err);
        } else {
            console.warn('RequestId-' + requestId, 'Client Error :', err);
        }
        var errorOptions = config.get('errorHandling');
        if (errorOptions.exposeServerErrorMessages && err.isServer) {
            var msgToLog = err.output.payload;
            if (err.data) {
                msgToLog.data = err.data;
            }
            msgToLog.errMessage = err.message;
            res.status(err.output.statusCode).set(err.output.headers).json(msgToLog);
            return;
        }
        res.status(err.output.statusCode).set(err.output.headers).json(err.output.payload);
    },
    notFound: function (req, res) {
        res.status(404).json({message: 'Route not found : ' + req.originalUrl});
    }
};

function exitProcess() {
    setTimeout(function () {
        // eslint-disable-next-line no-process-exit
        process.exit(1);
    }, 1000);
}

process.on('uncaughtException', function (err) {
    console.error('Unhandled Error on process : ', err);
    exitProcess();
});

process.on('exit', function () {
    console.log(packageJson.name + ' is exiting');
});

process.on("SIGTERM", function () {
    console.log("SIGTERM received stopping processing.");
    exitProcess();
});

process.on("SIGINT", function () {
    console.log("SIGINT received stopping processing.");
    exitProcess();
});