'use strict';
var _ = require('lodash');
var url = require('url');

module.exports = {
    basicAuth: basicAuth(),
    requestHeaders: _.merge(basicAuth()), //other headers that may be required, like requestId go here
    urlTemplate: urlTemplate
};

function basicAuth() {
    return {"Authorization": "Basic todo"};
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