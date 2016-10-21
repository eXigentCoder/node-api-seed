'use strict';
require('./config/init-nconf');
require('./src/logging/index');
var config = require('nconf');
var packageJson = require('./package.json');
var port = config.get('port');
var createApp = require('./src/app.js');
//var scheduler = require('./src/jobs/scheduler.js');

createApp(function (err, app) {
    if (err) {
        throw err;
    }
    app.listen(port, function () {
        //scheduler();
        console.info(packageJson.name + ' is listening on port ' + port);
    });
});