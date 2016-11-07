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
        loggly: { //todo, configure or remove
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
        preflightContinue: false // don't call next() for the preflight OPTIONS verb.
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
        trustProxy: false,// todo Used for if you're behind a reverse proxy (Heroku, Bluemix, AWS if you use an ELB, custom Nginx setup, etc). See https://expressjs.com/en/guide/behind-proxies.html
        jsonSpaces: 0,
        routerOptions: {
            mergeParams: true
        },
        helmetOptions: { //todo setup security options, see https://www.npmjs.com/package/helmet
            contentSecurityPolicy: {//loading resources
                directives: {
                    defaultSrc: ["'self'"],//todo only allow resources (css, js, html, etc) from our api.
                    styleSrc: ["'unsafe-inline'"],//inline css and css sections in headers.
                    reportUri: '/report-violation' //CSP violations will be posted here (server) from the browser.
                }
            },
            frameguard: { //iframe related security
                action: 'sameorigin' //todo only iframes from the same domain
            },
            // hpkp: { // todo pins the public key of your https cert to prevent man-in-the-middle attacks
            //     maxAge: 7776000, // ninetyDaysInSeconds
            //     sha256s: ['AbCdEf123=', 'ZyXwVu456='], set keys here
            //     includeSubdomains: true // only set to true if you are using subdomains
            // },
            // hsts: { //todo tells the browser to stick to  https, set this once you have https setup
            //     maxAge: 5184000 // sixtyDaysInSeconds
            // },
            noCache: false//set to true to ensure the browser doesn't cache things, can prevent old stale code from not refreshing on deploy
        },
        rateLimits: {
            default: {
                freeRetries: 1000, //The number of retires the user has before they need to start waiting (default: 2)
                minWait: 60 * 1000, //The initial wait time (in milliseconds) after the user runs out of retries (default: 500 milliseconds)
                maxWait: 60 * 1000 //The maximum amount of time (in milliseconds) between requests the user needs to wait (default: 15 minutes). The wait for a given request is determined by adding the time the user needed to wait for the previous two requests.
                //lifetime: 60, //The length of time (in seconds since the last request) to remember the number of requests that have been made by an IP. By default it will be set to maxWait * the number of attempts before you hit maxWait to discourage simply waiting for the lifetime to expire before resuming an attack. With default values this is about 6 hours.
            }
            // ,api: {
            //     Override defaults for api here
            // }
            // ,api: {
            //     Override defaults for authenticate here
            // }
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