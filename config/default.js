'use strict';
var passportJWT = require("passport-jwt");
var ExtractJwt = passportJWT.ExtractJwt;

var host = 'localhost';
var port = 10001;
module.exports = {
    PORT: port, // The port the app runs on and listens on for inbound requests.
    host: host, // The host value for the currently running app e.g. my-application.com
    logging: {
        console: {
            //Logs to stdout and stderr
            disabled: false, // controls if this method of logging is disabled or not
            level: 'silly',
            colorize: true,
            timestamp: true,
            json: false,
            stringify: false,
            prettyPrint: true,
            depth: 10,
            humanReadableUnhandledException: true,
            showLevel: true,
            handleExceptions: false
        },
        file: {
            // Logs to the local files system
            disabled: false, // controls if this method of logging is disabled or not
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
            // Logs to the remote loggly service. See https://www.loggly.com/
            disabled: true, // controls if this method of logging is disabled or not
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
            // Logs incoming HTTP requests and their results
            disabled: false, // controls if this method of logging is disabled or not
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
        correlationId: {
            // Sets up the rules for applying a correlation id to each request for tracking across async jobs in logs. See https://www.npmjs.com/package/request-id.
            reqHeader: 'X-Request-ID', // The incoming request header to look at for the correlation id.
            resHeader: 'X-Request-ID', // The response header to set for the correlation id.
            paramName: 'requestId' // The parameter in the query string to use to find the correlation id as well as the parameter on req to set to the correlation id.
        },
        objectReplacements: [
            // replaces values in objects to be logged. key must be a string, value can either be a value to replace with or a function that takes in the existing value as its only argument.
            {key: 'password', value: '****'}
        ]
    },
    errorHandling: {
        exposeServerErrorMessages: false, // Ensure that this is false on production environments to prevent leaking security vulnerabilities and stack information.
        exposeErrorRoutes: false // Set this to true if you need to test the /error routes
    },
    swagger: {
        // Swagger options, see http://npmjs.com/package/swagger-spec-express
        writeFile: false, // Controls if the constructed swagger.json file is written to disk. Useful if you need to distribute it or debug.
        appendPortToHost: false, // If you are running on localhost for example, you would want this to be true so that requests will go to localhost:port however it may be useful in other environments too.
        schemes: ['http'],
        security: [{jwt: []}],
        defaultSecurity: 'jwt',
        securityDefinitions: {
            jwt: {
                type: "oauth2",
                // description: "Json web tokens, see",
                // name: "Authorization",
                // in: 'header',
                flow: 'password',
                tokenUrl: '/authentication/application',
                scopes: {
                    "write:users": "modify users in the system",
                    "read:pets": "read users in the system"
                }
            }
        }
    },
    expressApp: {
        trustProxy: false,// todo Used for if you're behind a reverse proxy (Heroku, Bluemix, AWS if you use an ELB, custom Nginx setup, etc). See https://expressjs.com/en/guide/behind-proxies.html
        jsonSpaces: 0, // when you do res.json({...}) this value controls the spacing when stringifying.
        routerOptions: {
            mergeParams: true // Allows routers to inherit parameters from their ancestor routes.
        },
        corsOptions: {
            origin: [host + ':' + port],// todo If you need CORS for other origins, set that up here. See https://www.npmjs.com/package/cors for info.
            preflightContinue: false // don't call next() for the preflight OPTIONS verb.
        },
        helmetOptions: { //todo setup security options, see https://www.npmjs.com/package/helmet
            contentSecurityPolicy: {// loading resources
                directives: {
                    defaultSrc: ["'self'"],//todo only allow resources (css, js, html, etc) from our api.
                    styleSrc: ["'self'", "'unsafe-inline'"],// inline css and css sections in headers.
                    imgSrc: ["'self'", 'data:'],
                    scriptSrc: ["'self'", "'unsafe-inline'"],
                    reportUri: '/report-violation' // CSP violations will be posted here (server) from the browser.
                }
            },
            frameguard: { // iframe related security
                action: 'sameorigin' //todo only allows iframes from the same domain with this option
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
            // Rate limits and throttling using https://www.npmjs.com/package/express-brute
            default: {
                freeRetries: 1000, //The number of retires the user has before they need to start waiting (default: 2)
                minWait: 60 * 1000, //The initial wait time (in milliseconds) after the user runs out of retries (default: 500 milliseconds)
                maxWait: 60 * 1000 //The maximum amount of time (in milliseconds) between requests the user needs to wait (default: 15 minutes). The wait for a given request is determined by adding the time the user needed to wait for the previous two requests.
                //lifetime: 60, //The length of time (in seconds since the last request) to remember the number of requests that have been made by an IP. By default it will be set to maxWait * the number of attempts before you hit maxWait to discourage simply waiting for the lifetime to expire before resuming an attack. With default values this is about 6 hours.
            }
            // ,api: {
            //     Override defaults for api here
            // }
            // ,authenticate: {
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
        },
        allowDropData: false
    },
    authenticationOptions: {
        password: {
            saltRounds: 10 // controls how many rounds to use when generating a salt value to hash a password with. See https://www.npmjs.com/package/bcrypt
        },
        jwt: {
            jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
            secretOrKey: "GBfwT74YaHUYyfqH",
            issuer: host,
            algorithms: ["HS384"],
            ignoreExpiration: false,
            passReqToCallback: true,
            sign: {
                algorithm: 'HS384',
                expiresIn: '12h',
                issuer: host
            }
        }
    },
    tests: {
        defaultUser: {
            email: 'default@gmail.com',
            password: '12345678'
        }
    }
};