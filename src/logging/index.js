'use strict';
var winston = require('winston');
var packageJson = require('../../package.json');
require('winston-loggly');
require('winston-daily-rotate-file');
var config = require('nconf');
var formatArgs = require('./format-args');
var logSettings = config.get('logging');
var environment = config.get('NODE_ENV');
var fs = require('fs');
var logger = new winston.Logger({exitOnError: true});

switch (environment.toLowerCase()) {
    case 'production':
    case 'qa':
        addFileLogging('silly');
        addConsoleLogging('silly');
        addLogglyLogging('silly');
        break;
    case 'test':
        addFileLogging('silly');
        addConsoleLogging('silly');
        break;
    default:
        addFileLogging('silly');
        addConsoleLogging('silly');
        break;
}

function addConsoleLogging(level) {
    logger.add(winston.transports.Console, {
        level: level,
        colorize: true,
        timestamp: true,
        json: false,
        stringify: false,
        prettyPrint: true,
        depth: 10,
        humanReadableUnhandledException: true,
        showLevel: true,
        handleExceptions: true
    });
}

function addFileLogging(level) {
    (function ensureLogFolderExists() {
        fs.mkdir(logSettings.file.folder, function (error) {
            if (error && error.code !== 'EEXIST') {
                throw error;
            }
        });
    }());

    logger.add(winston.transports.DailyRotateFile, {
        name: 'file',
        datePattern: '.yyyy-MM-ddTHH',
        filename: logSettings.file.folder + '/' + environment + '-' + level,
        level: level,
        colorize: true,
        handleExceptions: true
    });
}

function addLogglyLogging(level) {
    var logglySettings = logSettings.loggly;
    if (!logglySettings.token) {
        console.warn("Loggly settings not provided, skipping");
        return;
    }
    logger.add(winston.transports.Loggly, {
        level: level,
        json: true,
        inputToken: logglySettings.token,
        subdomain: logglySettings.subdomain,
        auth: {
            username: logglySettings.username,
            password: logglySettings.password
        },
        tags: [packageJson.name],
        handleExceptions: true
    });
}

console.error = function () {
    logger.error.apply(logger, formatArgs(arguments));//level 0
};
console.warn = function () {
    logger.warn.apply(logger, formatArgs(arguments));//level 1
};
console.info = function () {
    logger.info.apply(logger, formatArgs(arguments));//level 2
};
console.log = function () {
    logger.info.apply(logger, formatArgs(arguments));//level 2
};
console.verbose = function () {
    logger.verbose.apply(logger, formatArgs(arguments));//level 3
};
console.debug = function () {
    logger.debug.apply(logger, formatArgs(arguments));//level 4
};
console.silly = function () {
    logger.silly.apply(logger, formatArgs(arguments));//level 5
};




