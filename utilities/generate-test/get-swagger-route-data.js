'use strict';
const _ = require('lodash');
const path = require('path');
const regexStringsToRemove = ['/^', '?(?=\\/|$)/i'];
const keyReplacementString = '(?:([^\\/]+?))';

module.exports = function getSwaggerDataFromRouteStack(stack, pathPrefix) {
    pathPrefix = pathPrefix || '';
    let routes = [];
    if (!stack || stack.length === 0) {
        return routes;
    }
    const swaggerRoutes = _.filter(stack, 'route.swaggerData');
    const routerRoutes = _.filter(stack, { name: 'router' });
    swaggerRoutes.forEach(function(middleware) {
        middleware.route.swaggerData.path = addPrefixToPath(pathPrefix, middleware.route.path);
        routes.push(middleware.route.swaggerData);
    });
    routerRoutes.forEach(function(middleware) {
        const newPrefix = getPathFromMiddleware(middleware);
        const subRoutes = getSwaggerDataFromRouteStack(middleware.handle.stack, pathPrefix + newPrefix);
        routes = routes.concat(subRoutes);
    });
    return routes;
};

function addPrefixToPath(pathPrefix, inputPath) {
    let result = path.join(pathPrefix, inputPath);
    result = result.replace(/\\/g, '/');
    result = result.replace(new RegExp('//', 'g'), '/');
    if (result[result.length - 1] === '/' && result.length > 1) {
        result = result.substr(0, result.length - 1);
    }
    return result;
}

function getPathFromMiddleware(middleware) {
    let result = middleware.regexp.toString();
    regexStringsToRemove.forEach(function(replacement) {
        const regEx = new RegExp(_.escapeRegExp(replacement), 'g');
        result = result.replace(regEx, '');
    });
    middleware.keys.forEach(function(key) {
        const index = result.indexOf(keyReplacementString);
        if (index >= 0) {
            result = result.replace(keyReplacementString, ':' + key.name);
        }
    });
    const regEx = new RegExp(_.escapeRegExp('\\/'), 'g');
    result = result.replace(regEx, '/');
    return result;
}
