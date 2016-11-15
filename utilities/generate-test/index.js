'use strict';
require('../../config/init-nconf');
var fs = require('fs');
var getSwaggerDataFromRouteStack = require('./get-swagger-route-data');
var eol = require('os').EOL;
var fileOptions = {encoding: 'utf8'};
var indentationTemplate = "    ";
var path = require('path');
var _ = require('lodash');
var config = require('nconf');
var uuid = require('node-uuid');

(function setInputs() {
    var data = {
        routerPath: './src/routes/users/index.js',
        tagsToGenerateFor: ['User'],
        outputPath: './test/routes/users/generated.js',
        routePrefix: '/users',
        pathParameters: {
            email: config.get('tests').defaultUser._id
        }
    };
    //eslint-disable-next-line global-require
    data.router = require(relativePath(__filename, data.routerPath));
    findRoutes(data);
}());

function findRoutes(data) {
    data.foundRoutes = getSwaggerDataFromRouteStack(data.router.stack);
    data.foundRoutes = data.foundRoutes.filter(function (route) {
        var included = false;
        data.tagsToGenerateFor.forEach(function (tag) {
            if (route.tags.indexOf(tag) >= 0) {
                included = true;
            }
        });
        return included;
    });
    writeRoutesAsTest(data);
}

function writeRoutesAsTest(data) {
    var outputContent = "";
    var indent = 0;
    addLine("'use strict';");
    addLine("var common = require('" + relativePath(data.outputPath, './test/@util/integration-common.js') + "');");
    addLine("var router = require('" + relativePath(data.outputPath, data.routerPath) + "');");
    addLine();
    addLine("describe('" + data.router.metadata.titlePlural + "', function () {");
    indent++;
    addLine("this.timeout(common.defaultTimeout);");
    data.foundRoutes.forEach(function (foundRoute) {
        addLine("describe('" + foundRoute.summary + "', function () {");
        indent++;
        addRoute(foundRoute);
        indent--;
        addLine("});");
    });
    indent--;
    addLine("});");
    //eslint-disable-next-line no-sync
    fs.writeFileSync(data.outputPath, outputContent, fileOptions);

    function addLine(line) {
        if (_.isNil(line)) {
            line = '';
        }
        outputContent += addLineWithIndent(line, indent);
    }

    function addRoute(foundRoute) {
        foundRoute.fullPath = getFullPath(foundRoute);
        if (foundRoute.verb === 'get') {
            if (foundRoute.path.indexOf(':') >= 0) {
                return addGetById(foundRoute);
            }
            return addQuery(foundRoute);
        }
        if (foundRoute.verb === 'post') {
            addCreate(foundRoute);
        }
        if (foundRoute.verb === 'put') {
            var newStausParam = foundRoute.parameters.some((param)=> {
                return param.name === 'newStatusName';
            });
            if (newStausParam) {
                return addUpdateStatus(foundRoute);
            }
            addUpdate(foundRoute);
        }
        if (foundRoute.verb === 'delete') {
            addDelete(foundRoute);
        }
    }

    function addQuery(foundRoute) {
        addHappy();
        addNoAuth();
        function addHappy() {
            addLine("it('Happy case', function (done) {");
            indent++;
            addLine("common.request.get('" + foundRoute.fullPath + "')");
            indent++;
            addLine(".set(common.authentication())");
            addLine(".expect(common.success(200))");
            addLine(".expect(common.matchesSwaggerSchema)");
            addLine(".expect(common.hasResults)");
            addLine(".end(common.logResponse(done));");
            indent--;
            indent--;
            addLine("});");
        }

        function addNoAuth() {
            addLine("it('No Authentication', function (done) {");
            indent++;
            addLine("common.request.get('" + foundRoute.fullPath + "')");
            indent++;
            addLine(".expect(common.error(401))");
            addLine(".expect(common.matchesSwaggerSchema)");
            addLine(".end(common.logResponse(done));");
            indent--;
            indent--;
            addLine("});");
        }
    }

    function addGetById(foundRoute) {
        addHappy();
        addNoAuth();
        addNotFound();
        function addHappy() {
            addLine("it('Happy case', function (done) {");
            indent++;
            addLine("common.request.get('" + foundRoute.fullPath + "')");
            indent++;
            addLine(".use(common.urlTemplate(" + JSON.stringify(getPathParameterObject(foundRoute)) + "))");
            addLine(".set(common.authentication())");
            addLine(".expect(common.success(200))");
            addLine(".expect(common.matchesSwaggerSchema)");
            addLine(".end(common.logResponse(done));");
            indent--;
            indent--;
            addLine("});");
        }

        function addNoAuth() {
            addLine("it('No Authentication', function (done) {");
            indent++;
            addLine("common.request.get('" + foundRoute.fullPath + "')");
            indent++;
            addLine(".use(common.urlTemplate(" + JSON.stringify(getPathParameterObject(foundRoute)) + "))");
            addLine(".expect(common.error(401))");
            addLine(".expect(common.matchesSwaggerSchema)");
            addLine(".end(common.logResponse(done));");
            indent--;
            indent--;
            addLine("});");
        }

        function addNotFound() {
            addLine("it('Invalid path parameter', function (done) {");
            indent++;
            addLine("common.request.get('" + foundRoute.fullPath + "')");
            indent++;
            addLine(".use(common.urlTemplate(" + JSON.stringify(getPathParameterObject(foundRoute, {fake: true})) + "))");
            addLine(".set(common.authentication())");
            addLine(".expect(common.error(404))");
            addLine(".expect(common.matchesSwaggerSchema)");
            addLine(".end(common.logResponse(done));");
            indent--;
            indent--;
            addLine("});");
        }
    }

    function addCreate(foundRoute) {
        addHappy();
        //addNoAuth();
        function addHappy() {
            console.log(foundRoute, data);
            addLine("it('Happy case', function (done) {");
            indent++;
            addLine("common.request.post('" + foundRoute.fullPath + "')");
            indent++;
            addLine(".send(common.generateDataFromSchema(router.metadata.schemas.creation))");
            addLine(".set(common.authentication())");
            addLine(".expect(common.success(200))");
            addLine(".expect(common.matchesSwaggerSchema)");
            addLine(".end(common.logResponse(done));");
            indent--;
            indent--;
            addLine("});");
        }
    }

    function addUpdate(foundRoute) {

        addLine('//update');
    }

    function addUpdateStatus(foundRoute) {

        addLine('//update status');
    }

    function addDelete(foundRoute) {
        addLine('//delete');
    }

    function getFullPath(foundRoute) {
        var url = (data.routePrefix || '') + foundRoute.path;
        if (_.endsWith(url, '/')) {
            url = url.substr(0, url.length - 1);
        }
        return url;
    }

    function getPathParameterObject(foundRoute, options) {
        options = options || {};
        var pathParams = foundRoute.parameters.filter((param)=> {
            return param.in === 'path';
        });
        var result = {};
        pathParams.forEach(function (pathParam) {
            if (options.fake) {
                result[pathParam.name] = uuid.v4();
                return;
            }
            var paramValue = data.pathParameters[pathParam.name];
            if (paramValue) {
                result[pathParam.name] = paramValue;
            } else {
                result[pathParam.name] = 'todo';
            }

        });
        return result;
    }
}

function relativePath(from, to) {
    return path.relative(from, to).replace(/\\/g, '/').replace('../', '');
}

function addLineWithIndent(line, indentLevel) {
    var outputContent = "";
    indentLevel = indentLevel || 0;
    for (var i = 0; i < indentLevel; i++) {
        outputContent += indentationTemplate;
    }
    outputContent += line + eol;
    return outputContent;
}