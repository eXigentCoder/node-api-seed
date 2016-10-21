'use strict';
module.exports = {
    port: 10010,
    logging: {
        console: {
            disabled: false,
            level: 'silly',
            colorize: true,
            timestamp: true,
            json: true,
            stringify: false,
            prettyPrint: true,
            depth: 10,
            humanReadableUnhandledException: true,
            showLevel: true,
            handleExceptions: true
        },
        file: {
            disabled: false,
            level: 'silly',
            timestamp: true,
            filename: '.log',
            maxsize: 1048576, //1m. This is per log file, in bytes, will be split if the log file gets to this size.
            json: true,
            prettyPrint: true,
            depth: 10,
            showLevel: true,
            zippedArchive: true,
            handleExceptions: true,
            datePattern: './logs/yyyy-MM-ddTHH',
            prepend: true
        },
        loggly: {
            disabled: true,
            level: 'silly',
            json: true,
            inputToken: '',
            subdomain: '',
            auth: {
                username: '',
                password: ''
            },
            tags: [],
            handleExceptions: true
        }
    }
};