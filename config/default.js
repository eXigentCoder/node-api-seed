'use strict';
module.exports = {
    PORT: 10001,
    host: 'localhost',
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
            datePattern: './logs/ddd-HH',
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
                    format: '[Start] :method ":url" :body RequestId-:req[x-request-id] ":user-agent"',
                    options: {
                        immediate: true
                    }
                },
                {
                    format: '[End] :method ":url" :status :response-time RequestId-:res[x-request-id] ":user-agent"',
                    options: {
                        immediate: false
                    }
                }
            ]
        },
        requestId: {},
        objectReplacements: [
            {key: 'password', value: '****'}
        ]
    },
    errorHandling: {
        exposeServerErrorMessages: false, //Ensure that this is false on production environments to prevent leaking security vulnerabilities
        exposeErrorRoutes: false
    },
    corsOptions: {
        /*todo If you need CORS to only be enabled for certain origins or routes, set that up here.
         See https://www.npmjs.com/package/cors for info.*/
    },
    swagger: {
        writeFile: false,
        appendPortToHost: false,
        schemes: ['http'],
        security: [{basicAuth: []}],
        defaultSecurity: 'basicAuth',
        securityDefinitions: {
            basicAuth: {
                type: "basic",
                description: "HTTP Basic Authentication. Works over HTTPS"
            }
        }
    },
    expressApp: {
        jsonSpaces: 0,
        xPoweredBy: false,
        routerOptions: {
            mergeParams: true
        }
    },
    mongodb: {
        url: "mongodb://localhost:27017/node-api-seed",
        options: {
            "server": {
                "socketOptions": {
                    "keepAlive": 1
                },
                "auto_reconnect": true,
                "autoReconnect": true,
                "sslValidate": false
            },
            "replSet": {
                "socketOptions": {
                    "keepAlive": 1
                },
                "auto_reconnect": true,
                "autoReconnect": true,
                "sslValidate": false
            }
        }
    }
};