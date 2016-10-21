'use strict';
module.exports = {
    port: 10010,
    logging: {
        console: {
            disabled: false,
            level: 'silly',
            colorize: true,
            timestamp: true,
            json: false,
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
            maxsize: 1048576, //bytes
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
        },
        morgan: {
            disabled: false,
            skip: {
                paths: ['/public/', '/favicon.ico'],
                headers: [{key: 'user-agent', value: 'AlwaysOn'}]
            },
            loggers: [
                {
                    format: '[Start] :method ":url" ":user-agent" :body',
                    options: {
                        immediate: true
                    }
                },
                {
                    format: '[End] :method ":url" :status :response-time ":user-agent"',
                    options: {
                        immediate: false
                    }
                }
            ]
        }
    },
    corsOptions: {
        /*todo If you need CORS to only be enabled for certain origins or routes, set that up here.
         See https://www.npmjs.com/package/cors for info.*/
    }
};