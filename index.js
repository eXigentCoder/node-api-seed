'use strict';
require('./config/init-nconf');
require('./src/logging/index');
require("nodejs-dashboard");
var util = require('util');
var config = require('nconf');
var packageJson = require('./package.json');
var port = config.get('PORT');
var createApp = require('./src/app.js');

createApp(function (err, app) {
    if (err) {
        throw err;
    }
    app.listen(port, function () {
        console.info(util.format('%s is listening at http://%s:%s', packageJson.name, config.get('host'), port));
    });
});