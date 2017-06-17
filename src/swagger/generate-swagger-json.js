const swagger = require('swagger-spec-express');
const config = require('nconf');
const os = require('os');
const fs = require('fs');
const util = require('util');

module.exports = function generateSwaggerJson(app, callback) {
    swagger.compile();
    const result = swagger.validate();
    if (!result.valid) {
        console.warn(
            util.format(
                'Compiled Swagger document does not pass validation:%s%s%s',
                os.EOL,
                result.message,
                result.errors
            )
        );
    }
    const swaggerConfig = config.get('swagger');
    if (swaggerConfig.writeFile) {
        return writeSwaggerFileToDisk(app, callback);
    }
    console.log('Swagger JSON generated');
    return callback(null, app);
};

function writeSwaggerFileToDisk(app, callback) {
    fs.writeFile('./src/swagger/swagger.json', JSON.stringify(swagger.json(), null, 4), function(
        err
    ) {
        return callback(err, app);
    });
}
