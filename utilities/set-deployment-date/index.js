'use strict';
const fs = require('fs');
const path = './package.json';
const options = { encoding: 'utf8' };
const util = require('util');
const moment = require('moment');
let packageJson = fs.readFileSync(path, options);
try {
    packageJson = JSON.parse(packageJson);
} catch (err) {
    throw new Error(util.format('Error parsing package.json: %s', err.message));
}
packageJson.deploymentDate = moment.utc().toISOString();
fs.writeFileSync(path, JSON.stringify(packageJson, null, 2), options);
