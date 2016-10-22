'use strict';
var swagger = require('swagger-spec-express');
var config = require('nconf');
var swaggerConfig = config.get('swagger');
var os = require('os');
var fs = require('fs');

module.exports = function generateSwaggerJson(app, callback) {
    swagger.compile();
    var result = swagger.validate();
    if (!result.valid) {
        console.warn("Compiled Swagger document does not pass validation: " + os.EOL + result.message);
    }
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