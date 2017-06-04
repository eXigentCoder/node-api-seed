'use strict';
const url = require('url');
const authentication = require('../../src/authentication');

module.exports = {
    authentication: setAuthentication,
    urlTemplate: urlTemplate
};

function setAuthentication(options) {
    let token;
    options = options || {};
    if (options.user) {
        token = authentication.getUserToken(options.user);
    } else if (options.token) {
        token = options.token;
    }
    if (!token) {
        throw new Error('Either options.user or options.token must be set.');
    }
    return { Authorization: 'Bearer ' + token };
}

function urlTemplate(pathParameters) {
    return function(request) {
        request.urlTemplate = normalisePath(url.parse(request.url).path);
        Object.keys(pathParameters).forEach(function(key) {
            const regex = new RegExp(':' + key, 'gi');
            request.url = request.url.replace(regex, pathParameters[key]);
        });
        return request;
    };
}

function normalisePath(inputPath) {
    const pathArr = inputPath.split('/');
    for (let i = 0; i < pathArr.length; i++) {
        if (pathArr[i].substring(0, 1) === ':') {
            pathArr[i] = '{' + pathArr[i].substring(1) + '}';
        }
    }
    return pathArr.join('/');
}
