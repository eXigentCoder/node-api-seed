const winston = require('winston');
const packageJson = require('../../package.json');
require('winston-loggly');
require('winston-daily-rotate-file');
const WinstonGraylog2 = require('winston-graylog2');
const config = require('nconf');
const formatArgs = require('./format-args');
const _ = require('lodash');
const logSettings = config.get('logging');
const fs = require('fs');
const path = require('path');
const logger = new winston.Logger({ exitOnError: true });
addConsoleLogging();
addFileLogging();
addLogglyLogging();
addGraylogLogging();
overrideConsole();

function addConsoleLogging() {
    const consoleSettings = logSettings.console;
    if (consoleSettings.disabled) {
        return;
    }
    logger.add(winston.transports.Console, _.omit(consoleSettings, 'disabled'));
}

function addFileLogging() {
    const fileSettings = logSettings.file;
    if (fileSettings.disabled) {
        return;
    }
    const folder = path.dirname(fileSettings.datePattern);
    ensureLogFolderExists(folder);
    logger.add(winston.transports.DailyRotateFile, _.omit(fileSettings, 'disabled'));
}
function ensureLogFolderExists(folder) {
    if (!folder) {
        return;
    }
    fs.mkdir(folder, function(error) {
        if (error && error.code !== 'EEXIST') {
            throw error;
        }
    });
}

function addLogglyLogging() {
    const logglySettings = logSettings.loggly;
    if (logglySettings.disabled) {
        return;
    }
    if (_.isNil(logglySettings.tags)) {
        logglySettings.tags = [];
    }
    if (!_.isArray(logglySettings.tags)) {
        throw new TypeError('Tags should be an array of strings');
    }
    if (logglySettings.tags.indexOf(packageJson.name) < 0) {
        logglySettings.tags.push(packageJson.name);
    }
    logger.add(winston.transports.Loggly, _.omit(logglySettings, 'disabled'));
}

function addGraylogLogging() {
    const logglySettings = logSettings.graylog;
    if (logglySettings.disabled) {
        return;
    }
    logger.add(WinstonGraylog2, _.omit(logglySettings, 'disabled'));
}

function overrideConsole() {
    console.error = function() {
        logger.error.apply(logger, formatArgs(arguments)); //level 0
    };
    console.warn = function() {
        logger.warn.apply(logger, formatArgs(arguments)); //level 1
    };
    console.info = function() {
        logger.info.apply(logger, formatArgs(arguments)); //level 2
    };
    console.log = function() {
        logger.info.apply(logger, formatArgs(arguments)); //level 2
    };
    console.verbose = function() {
        logger.verbose.apply(logger, formatArgs(arguments)); //level 3
    };
    console.debug = function() {
        logger.debug.apply(logger, formatArgs(arguments)); //level 4
    };
    console.silly = function() {
        logger.silly.apply(logger, formatArgs(arguments)); //level 5
    };
}
