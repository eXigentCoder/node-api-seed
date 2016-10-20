'use strict';
require('fs'); //must be required here in order to load files from disk.
var nconf = require('nconf');
nconf.argv()
    .env()
    .defaults({NODE_ENV: 'development'});
var environment = nconf.get('NODE_ENV');
//eslint-disable-next-line no-process-env
process.env.NODE_ENV = environment;
//todo RK instead of json file, require a .js file, merge that and pass to overrides/defaults
var defaultFilePath = './config/default.json';
var envFilePath = './config/' + environment + '.json';
nconf.file('envFile', envFilePath);
nconf.file('defaultFile', defaultFilePath);