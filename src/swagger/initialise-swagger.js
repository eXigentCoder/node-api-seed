'use strict';
var config = require('nconf');
var packageJson = require('../../package.json');
var swagger = require('swagger-spec-express');
var swaggerConfig = config.get('swagger');

module.exports = function initialiseSwagger(app, callback) {
    var host = config.get('host');
    if (swaggerConfig.appendPortToHost) {
        host += ":" + config.get('PORT');
    }
    var baseDocument = {
        swagger: "2.0",
        info: {
            title: packageJson.title,
            version: packageJson.version,
            description: packageJson.description,
            termsOfService: 'Private',
            contact: {
                name: "Support",
                url: "https://todo.co.za/",
                email: "support@todo.co.za"
            }
        },
        host: host,
        schemes: config.get('schemes'),
        consumes: ["application/json"],
        produces: ["application/json"],
        security: [{basicAuth: []}],
        securityDefinitions: {
            basicAuth: {
                type: "basic",
                description: "HTTP Basic Authentication. Works over HTTPS"
            }
        }
    };
    var options = {
        document: baseDocument,
        defaultSecurity: "basicAuth"
    };
    try {
        swagger.initialise(app, options);
    }
    catch (err) {
        return callback(err, app);
    }
    return callback(null, app);
};