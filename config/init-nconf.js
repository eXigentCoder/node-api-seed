'use strict';
var _ = require('lodash');
var nconf = require('nconf');
var util = require('util');
var envDefault = {NODE_ENV: 'development'};
nconf.argv()
    .env()
    .defaults(envDefault)
    .use('memory'); //lets us call set later on
var environment = nconf.get('NODE_ENV');
//eslint-disable-next-line no-process-env
process.env.NODE_ENV = environment;
var defaultConfig = require('./default.js');
var envFilePath = './' + environment + '.js';
var environmentConfig = require(envFilePath);
_.merge(envDefault, defaultConfig, environmentConfig);
nconf.defaults(envDefault);
util.inspect.defaultOptions.showHidden = true;
util.inspect.defaultOptions.depth = 10;