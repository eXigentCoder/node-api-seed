'use strict';
require('./config/init-nconf');
require('./src/logging/index');
var config = require('nconf');
var packageJson = require('./package.json');
var port = config.get('port');
var createApp = require('./src/app.js');

createApp(function (err, app) {
    if (err) {
        throw err;
    }
    app.listen(port, function () {
        console.info(packageJson.name + ' is listening on port ' + port);
    });
});