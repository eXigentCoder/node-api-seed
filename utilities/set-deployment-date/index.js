'use strict';
var fs = require('fs');
var path = './package.json';
var options = {encoding: 'utf8'};
var util = require('util');
var moment = require('moment');
var packageJson = fs.readFileSync(path, options);
try {
    packageJson = JSON.parse(packageJson);
}
catch (err) {
    throw new Error(util.format("Error parsing package.json: %s", err.message));
}
packageJson.deploymentDate = moment.utc().toISOString();
fs.writeFileSync(path, JSON.stringify(packageJson, null, 2), options);