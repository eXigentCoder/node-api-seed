'use strict';
const _ = require('lodash');
const nconf = require('nconf');
const util = require('util');
const defaultConfig = require('./default.js');

module.exports = function(source) {
    if (!source) {
        throw new Error('Source is required');
    }
    const envDefault = { NODE_ENV: 'development' };
    nconf.argv().env().defaults(envDefault).use('memory'); //lets us call set later on
    const environment = nconf.get('NODE_ENV');
    //eslint-disable-next-line no-process-env
    process.env.NODE_ENV = environment;
    console.log('Environment set to ' + environment);
    const envFilePath = './' + environment + '.js';
    const options = {
        source
    };
    //eslint-disable-next-line global-require
    const environmentConfig = require(envFilePath)(options);

    _.merge(envDefault, defaultConfig(options), environmentConfig);
    nconf.defaults(envDefault);
    util.inspect.defaultOptions.showHidden = false;
    util.inspect.defaultOptions.depth = 10;
};
