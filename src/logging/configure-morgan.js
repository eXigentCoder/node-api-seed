'use strict';
var morgan = require('morgan');
var config = require('nconf');
var morganConfig = config.get('logging').morgan;
var _ = require('lodash');

module.exports = function configureMorgan(app) {
    if (morganConfig.disabled) {
        return;
    }
    addSupportForBodyToken();
    morganConfig.loggers = morganConfig.loggers || [];
    if (morganConfig.loggers.length === 0) {
        throw new Error("No morgan loggers supplied, if you don't want to use morgan, set disabled to true in config.loggers.morgan");
    }
    morganConfig.loggers.forEach(function (logger) {
        logger.options = logger.options || {};
        logger.options.skip = skip;
        logger.options.stream = consoleStream(logger.level);
        app.use(morgan(logger.format, logger.options));
    });
};
function consoleStream(level) {
    level = level || 'verbose';
    if (!_.isFunction(console[level])) {
        throw new Error('Invalid log level specified for morgan logger :' + level);
    }
    return {
        write: function (message) {
            console[level](message);
        }
    };
}

function skip(req) {
    if (!morganConfig.skip) {
        return;
    }
    morganConfig.skip.headers = morganConfig.skip.headers || [];
    morganConfig.skip.headers.forEach(function (ignoredHeader) {
        if (req.get(ignoredHeader.key).toLowerCase().indexOf(ignoredHeader.value.toLowerCase()) >= 0) {
            return true;
        }
    });
    morganConfig.skip.paths = morganConfig.skip.paths || [];
    morganConfig.skip.paths.forEach(function (ignoredUrl) {
        if (req.originalUrl.toLowerCase().indexOf(ignoredUrl.toLowerCase()) >= 0) {
            return true;
        }
    });
}

function addSupportForBodyToken() {
    morgan.token('body', function (req) {
        if (!req.body) {
            return '';
        }
        return JSON.stringify(req.body);
    });
}