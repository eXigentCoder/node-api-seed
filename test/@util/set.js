'use strict';
var _ = require('lodash');
var url = require('url');
var config = require('nconf');
var authentication = require('../../src/authentication');

module.exports = {
    authentication: setAuthentication,
    requestHeaders: function () {
        return _.merge(setAuthentication());// other headers that may be required, like requestId go here
    },
    urlTemplate: urlTemplate
};

function setAuthentication(options) {
    var token;
    options = options || {};
    if (options.user) {
        token = authentication.getUserToken(options.user);
    }
    else if (options.token) {
        token = options.token;
    } else {
        token = config.get('defaultUserAuthToken');
    }
    if (!token) {
        throw new Error("Token not yet set.");
    }
    return {"Authorization": "Bearer " + token};
}

function urlTemplate(pathParameters) {
    return function (request) {
        request.urlTemplate = normalisePath(url.parse(request.url).path);
        Object.keys(pathParameters).forEach(function (key) {
            var regex = new RegExp(':' + key, 'gi');
            request.url = request.url.replace(regex, pathParameters[key]);
        });
        return request;
    };
}

function normalisePath(inputPath) {
    var pathArr = inputPath.split('/');
    for (var i = 0; i < pathArr.length; i++) {
        if (pathArr[i].substring(0, 1) === ":") {
            pathArr[i] = "{" + pathArr[i].substring(1) + "}";
        }
    }
    return pathArr.join('/');
}