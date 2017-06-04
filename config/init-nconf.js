'use strict';
const _ = require('lodash');
const nconf = require('nconf');
const util = require('util');
const envDefault = { NODE_ENV: 'development' };
nconf.argv().env().defaults(envDefault).use('memory'); //lets us call set later on
const environment = nconf.get('NODE_ENV');
//eslint-disable-next-line no-process-env
process.env.NODE_ENV = environment;
const defaultConfig = require('./default.js');
const envFilePath = './' + environment + '.js';
const environmentConfig = require(envFilePath);
_.merge(envDefault, defaultConfig, environmentConfig);
nconf.defaults(envDefault);
util.inspect.defaultOptions.showHidden = false;
util.inspect.defaultOptions.depth = 10;
