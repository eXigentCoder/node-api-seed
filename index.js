'use strict';
require('./config/init-nconf');
require('./src/logging/index');
var Gelf = require('gelf');
var gelf = new Gelf({
    graylogPort: 5555,
    graylogHostname: '127.0.0.1',
    connection: 'wan',
    maxChunkSizeWan: 1420,
    maxChunkSizeLan: 8154
});
gelf.emit('gelf.log', 'myshortmessage');
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