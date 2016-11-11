'use strict';
var swagger = require('swagger-spec-express');
var config = require('nconf');
var os = require('os');
var fs = require('fs');
var util = require('util');

module.exports = function generateSwaggerJson(app, callback) {
    swagger.compile();
    var result = swagger.validate();
    if (!result.valid) {
        console.warn(util.format("Compiled Swagger document does not pass validation:%s%s%s", os.EOL, result.message, result.errors));
    }
    var swaggerConfig = config.get('swagger');
    if (swaggerConfig.writeFile) {
        return writeSwaggerFileToDisk(app, callback);
    }
    return callback(null, app);
};

function writeSwaggerFileToDisk(app, callback) {
    fs.writeFile('./src/swagger/swagger.json', JSON.stringify(swagger.json(), null, 4), function (err) {
        return callback(err, app);
    });
}