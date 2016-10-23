'use strict';
var config = require('nconf');
var packageJson = require('../../package.json');
var swagger = require('swagger-spec-express');
var swaggerConfig = config.get('swagger');
var _ = require('lodash');

module.exports = function initialiseSwagger(app, callback) {
    var baseDocument = swaggerConfig.baseDocument || buildBaseDocument();
    var options = {
        document: baseDocument,
        defaultSecurity: swaggerConfig.defaultSecurity
    };
    try {
        swagger.initialise(app, options);
    }
    catch (err) {
        return callback(err, app);
    }
    return callback(null, app);
};

function buildBaseDocument() {
    var host = config.get('host');
    if (swaggerConfig.appendPortToHost) {
        host += ":" + config.get('PORT');
    }
    var contactInfo = getContactInfoFromPackage();
    contactInfo.name = _.get(swaggerConfig, 'contact.name') || contactInfo.name;
    contactInfo.url = _.get(swaggerConfig, 'contact.url') || contactInfo.url;
    contactInfo.email = _.get(swaggerConfig, 'contact.email') || contactInfo.email;
    return {
        swagger: "2.0",
        info: {
            title: packageJson.title,
            version: packageJson.version,
            description: packageJson.description,
            termsOfService: 'Private',
            contact: contactInfo,
            license: {
                name: _.get(swaggerConfig, 'license.name') || packageJson.license,
                url: _.get(swaggerConfig, 'license.url') || 'https://spdx.org/licenses/' + packageJson.license + '.html'
            }
        },
        host: host,
        schemes: swaggerConfig.schemes || ['http'],
        consumes: swaggerConfig.consumes || ["application/json"],
        produces: swaggerConfig.produces || ["application/json"],
        security: swaggerConfig.security,
        securityDefinitions: swaggerConfig.securityDefinitions
    };
}

function getContactInfoFromPackage() {
    var authorName, authorEmail, authorSite;
    if (packageJson.author.indexOf('<') >= 0) {
        var parts = packageJson.author.split('<');
        if (parts.length > 2) {
            throw new Error('package.json.author should be in the format "name <email> (website)" with email and website being optional');
        }
        authorName = parts[0].trim();
        authorEmail = parts[1].replace('>', '').trim();
        if (authorEmail.indexOf('(') >= 0) {
            parts = authorEmail.split('(');
            if (parts.length > 2) {
                throw new Error('package.json.author should be in the format "name <email> (website)" with email and website being optional');
            }
            authorEmail = parts[0].trim();
            authorSite = parts[1].replace(')', '').trim();
        }
    } else {
        authorName = packageJson.author;
    }
    return {
        name: authorName,
        url: _.get(packageJson, 'bugs.url') || authorSite,
        email: authorEmail
    };
}