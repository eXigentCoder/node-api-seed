'use strict';
var host = 'localhost';
var port = 10001;
module.exports = {
    PORT: port,
    host: host,
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
                paths: ['/public/', '/favicon.ico', '/apidocs/'],
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
        origin: [host + ':' + port],// todo If you need CORS for other origins, set that up here. See https://www.npmjs.com/package/cors for info.
        preflightContinue: false //don't call next() for the preflight OPTIONS verb.
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
        routerOptions: {
            mergeParams: true
        },
        helmetOptions: { //todo setup security options, see https://www.npmjs.com/package/helmet
            contentSecurityPolicy: {//loading resources
                directives: {
                    defaultSrc: ["'self'"],//only allow resources (css, js, html, etc) from our api.
                    styleSrc: ["'unsafe-inline'"],//inline css and css sections in headers.
                    reportUri: '/report-violation' //CSP violations will be posted here (server) from the browser.
                }
            },
            frameguard: { //iframe related security
                action: 'sameorigin' //only iframes from the same domain
            },
            // hpkp: { // pins the public key of your https cert to prevent man-in-the-middle attacks
            //     maxAge: 7776000, // ninetyDaysInSeconds
            //     sha256s: ['AbCdEf123=', 'ZyXwVu456='], set keys here
            //     includeSubdomains: true // only set to true if you are using subdomains
            // },
            // hsts: { //tells the browser to stick to  https, set this once you have https setup
            //     maxAge: 5184000 // sixtyDaysInSeconds
            // },
            noCache: false//set to true to ensure the browser doesn't cache things, can prevent old stale code from not refreshing on deploy
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