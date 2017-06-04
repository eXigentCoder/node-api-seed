'use strict';
require('./config/init-nconf')('Api');
require('./src/logging/index');
const util = require('util');
const config = require('nconf');
const packageJson = require('./package.json');
const port = config.get('PORT');
const createApp = require('./src/app.js');

createApp(function(err, app) {
    if (err) {
        throw err;
    }
    app.listen(port, function() {
        console.info(
            util.format(
                '%s is listening at http://%s:%s',
                packageJson.name,
                config.get('host'),
                port
            )
        );
    });
});
