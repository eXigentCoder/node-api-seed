const morgan = require('morgan');
const config = require('nconf');
const util = require('util');
const _ = require('lodash');

module.exports = function configureMorgan(app) {
    const morganConfig = config.get('logging').morgan;
    if (morganConfig.disabled) {
        return;
    }
    addSupportForBodyToken();
    morganConfig.loggers = morganConfig.loggers || [];
    if (morganConfig.loggers.length === 0) {
        throw new Error(
            "No morgan loggers supplied, if you don't want to use morgan, set disabled to true in config.loggers.morgan"
        );
    }
    morganConfig.loggers.forEach(function(logger) {
        logger.options = logger.options || {};
        logger.options.skip = skip(morganConfig);
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
        write: function(message) {
            console[level](message);
        }
    };
}

function skip(morganConfig) {
    return function _skip(req) {
        if (!morganConfig.skip) {
            return;
        }
        morganConfig.skip.headers = morganConfig.skip.headers || [];
        let shouldSkip = morganConfig.skip.headers.some(function(ignoredHeader) {
            let header = req.get(ignoredHeader.key);
            if (!header) {
                return false;
            }
            return header.toLowerCase().indexOf(ignoredHeader.value.toLowerCase()) >= 0;
        });
        if (shouldSkip) {
            return true;
        }
        morganConfig.skip.paths = morganConfig.skip.paths || [];
        shouldSkip = morganConfig.skip.paths.some(function(ignoredUrl) {
            return req.originalUrl.toLowerCase().indexOf(ignoredUrl.toLowerCase()) >= 0;
        });
        if (shouldSkip) {
            return true;
        }
    };
}

function addSupportForBodyToken() {
    morgan.token('body', function(req) {
        if (!req.body) {
            return '';
        }
        return util.inspect(req.body, config.get('logging').utilInspectOptions);
    });
}
