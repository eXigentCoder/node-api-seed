'use strict';
require('../../config/init-nconf')('Script-GenerateTests');
const fs = require('fs');
const getSwaggerDataFromRouteStack = require('./get-swagger-route-data');
const eol = require('os').EOL;
const fileOptions = { encoding: 'utf8' };
const indentationTemplate = '    ';
const path = require('path');
const _ = require('lodash');
const config = require('nconf');
const uuid = require('node-uuid');

(function setInputs() {
    // var data = {
    //     routerPath: './src/routes/users/index.js',
    //     tagsToGenerateFor: ['User'],
    //     outputPath: './test/routes/users/index.integration.js',
    //     routePrefix: '/users',
    //     pathParameters: {
    //         email: config.get('tests').adminUser._id,
    //         newStatusName: 'testStatus'
    //     }
    // };
    const data = {
        routerPath: './src/routes/users/items/index.js',
        tagsToGenerateFor: ['Item'],
        outputPath: './test/routes/users/items/index.integration.js',
        routePrefix: '/users/:email/items',
        pathParameters: {
            email: config.get('tests').adminUser._id,
            name: 'item1'
        }
    };
    //eslint-disable-next-line global-require
    data.router = require(relativePath(__filename, data.routerPath));
    findRoutes(data);
})();

function findRoutes(data) {
    data.foundRoutes = getSwaggerDataFromRouteStack(data.router.stack);
    data.foundRoutes = data.foundRoutes.filter(function(route) {
        let included = false;
        data.tagsToGenerateFor.forEach(function(tag) {
            if (route.tags.indexOf(tag) >= 0) {
                included = true;
            }
        });
        return included;
    });
    writeRoutesAsTest(data);
}

function ensureAllFoldersExist(filePath) {
    const folderPath = path.dirname(filePath);
    const folders = folderPath.split('/'); //.filter((part)=> part !== '.');
    let pathToCheck = '';
    folders.forEach(function(folder) {
        pathToCheck = path.join(pathToCheck, folder);
        //eslint-disable-next-line no-sync
        if (!fs.existsSync(pathToCheck)) {
            //eslint-disable-next-line no-sync
            fs.mkdirSync(pathToCheck);
        }
    });
}

function writeRoutesAsTest(data) {
    let outputContent = '';
    let indent = 0;
    addLine("'use strict';");
    addLine(
        "var common = require('" +
            relativePath(data.outputPath, './test/@util/integration-common.js') +
            "');"
    );
    addLine("var router = require('" + relativePath(data.outputPath, data.routerPath) + "');");
    addLine("var config = require('nconf');");
    addLine();
    addLine("describe('" + data.router.metadata.titlePlural + "', function () {");
    indent++;
    addLine('this.timeout(common.defaultTimeout);');
    data.foundRoutes.forEach(function(foundRoute, index) {
        addLine("describe('" + foundRoute.summary + "', function () {");
        indent++;
        addRoute(foundRoute);
        indent--;
        addLine('});');
        if (index < data.foundRoutes.length - 1) {
            addLine();
        }
    });
    indent--;
    addLine('});');
    ensureAllFoldersExist(data.outputPath);

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
        foundRoute.pathParameters = getPathParameterObject(foundRoute);
        foundRoute.pathParameterString = JSON.stringify(foundRoute.pathParameters);
        foundRoute.hasPathParameters = Object.keys(foundRoute.pathParameters).length > 0;
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
            const newStausParam = foundRoute.parameters.some(param => {
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
            if (foundRoute.hasPathParameters) {
                addLine('.use(common.urlTemplate(' + foundRoute.pathParameterString + '))');
            }
            addLine(".set(common.authentication({user: config.get('tests').adminUser}))");
            addLine('.expect(common.success(200))');
            addLine('.expect(common.matchesSwaggerSchema)');
            addLine('.expect(common.hasResults)');
            addLine('.end(common.logResponse(done));');
            indent--;
            indent--;
            addLine('});');
        }

        function addNoAuth() {
            addLine("it('No Authentication', function (done) {");
            indent++;
            addLine("common.request.get('" + foundRoute.fullPath + "')");
            indent++;
            if (foundRoute.hasPathParameters) {
                addLine('.use(common.urlTemplate(' + foundRoute.pathParameterString + '))');
            }
            addLine('.expect(common.error(401))');
            addLine('.expect(common.matchesSwaggerSchema)');
            addLine('.end(common.logResponse(done));');
            indent--;
            indent--;
            addLine('});');
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
            if (foundRoute.hasPathParameters) {
                addLine('.use(common.urlTemplate(' + foundRoute.pathParameterString + '))');
            }
            addLine(".set(common.authentication({user: config.get('tests').adminUser}))");
            addLine('.expect(common.success(200))');
            addLine('.expect(common.matchesSwaggerSchema)');
            addLine('.end(common.logResponse(done));');
            indent--;
            indent--;
            addLine('});');
        }

        function addNoAuth() {
            addLine("it('No Authentication', function (done) {");
            indent++;
            addLine("common.request.get('" + foundRoute.fullPath + "')");
            indent++;
            if (foundRoute.hasPathParameters) {
                addLine('.use(common.urlTemplate(' + foundRoute.pathParameterString + '))');
            }
            addLine('.expect(common.error(401))');
            addLine('.expect(common.matchesSwaggerSchema)');
            addLine('.end(common.logResponse(done));');
            indent--;
            indent--;
            addLine('});');
        }

        function addNotFound() {
            addLine("it('Invalid path parameter', function (done) {");
            indent++;
            addLine("common.request.get('" + foundRoute.fullPath + "')");
            indent++;
            addLine(
                '.use(common.urlTemplate(' +
                    JSON.stringify(getPathParameterObject(foundRoute, { fake: true })) +
                    '))'
            );
            addLine(".set(common.authentication({user: config.get('tests').adminUser}))");
            addLine('.expect(common.error(404))');
            addLine('.expect(common.matchesSwaggerSchema)');
            addLine('.end(common.logResponse(done));');
            indent--;
            indent--;
            addLine('});');
        }
    }

    function addCreate(foundRoute) {
        addHappy();
        addNoAuth();
        addNoData();
        function addHappy() {
            addLine("it('Happy case', function (done) {");
            indent++;
            addLine("common.request.post('" + foundRoute.fullPath + "')");
            indent++;
            if (foundRoute.hasPathParameters) {
                addLine('.use(common.urlTemplate(' + foundRoute.pathParameterString + '))');
            }
            addLine('.send(common.generateDataFromSchema(router.metadata.schemas.creation))');
            addLine(".set(common.authentication({user: config.get('tests').adminUser}))");
            addLine('.expect(common.success(201))');
            addLine('.expect(common.matchesSwaggerSchema)');
            addLine('.end(common.logResponse(done));');
            indent--;
            indent--;
            addLine('});');
        }

        function addNoAuth() {
            addLine("it('No Authentication', function (done) {");
            indent++;
            addLine("common.request.post('" + foundRoute.fullPath + "')");
            indent++;
            if (foundRoute.hasPathParameters) {
                addLine('.use(common.urlTemplate(' + foundRoute.pathParameterString + '))');
            }
            addLine('.send(common.generateDataFromSchema(router.metadata.schemas.creation))');
            addLine('.expect(common.error(401))');
            addLine('.expect(common.matchesSwaggerSchema)');
            addLine('.end(common.logResponse(done));');
            indent--;
            indent--;
            addLine('});');
        }

        function addNoData() {
            addLine("it('No Data', function (done) {");
            indent++;
            addLine("common.request.post('" + foundRoute.fullPath + "')");
            indent++;
            if (foundRoute.hasPathParameters) {
                addLine('.use(common.urlTemplate(' + foundRoute.pathParameterString + '))');
            }
            addLine('.send({})');
            addLine(".set(common.authentication({user: config.get('tests').adminUser}))");
            addLine('.expect(common.error(400))');
            addLine('.expect(common.matchesSwaggerSchema)');
            addLine('.end(common.logResponse(done));');
            indent--;
            indent--;
            addLine('});');
        }
    }

    function addUpdate(foundRoute) {
        addHappy();
        addNoAuth();
        addNoData();
        function addHappy() {
            addLine("it('Happy case', function (done) {");
            indent++;
            addLine("common.request.put('" + foundRoute.fullPath + "')");
            indent++;
            if (foundRoute.hasPathParameters) {
                addLine('.use(common.urlTemplate(' + foundRoute.pathParameterString + '))');
            }
            addLine('.send(common.generateDataFromSchema(router.metadata.schemas.update))');
            addLine(".set(common.authentication({user: config.get('tests').adminUser}))");
            addLine('.expect(common.success(204))');
            addLine('.end(common.logResponse(done));');
            indent--;
            indent--;
            addLine('});');
        }

        function addNoAuth() {
            addLine("it('No Authentication', function (done) {");
            indent++;
            addLine("common.request.put('" + foundRoute.fullPath + "')");
            indent++;
            if (foundRoute.hasPathParameters) {
                addLine('.use(common.urlTemplate(' + foundRoute.pathParameterString + '))');
            }
            addLine('.send(common.generateDataFromSchema(router.metadata.schemas.update))');
            addLine('.expect(common.error(401))');
            addLine('.end(common.logResponse(done));');
            indent--;
            indent--;
            addLine('});');
        }

        function addNoData() {
            addLine("it('No Data', function (done) {");
            indent++;
            addLine("common.request.put('" + foundRoute.fullPath + "')");
            indent++;
            if (foundRoute.hasPathParameters) {
                addLine('.use(common.urlTemplate(' + foundRoute.pathParameterString + '))');
            }
            addLine('.send({})');
            addLine(".set(common.authentication({user: config.get('tests').adminUser}))");
            addLine('.expect(common.error(400))');
            addLine('.end(common.logResponse(done));');
            indent--;
            indent--;
            addLine('});');
        }
    }

    function addUpdateStatus(foundRoute) {
        addHappy();
        addNoAuth();
        addNoData();
        function addHappy() {
            addLine("it('Happy case', function (done) {");
            indent++;
            addLine("common.request.put('" + foundRoute.fullPath + "')");
            indent++;
            if (foundRoute.hasPathParameters) {
                addLine('.use(common.urlTemplate(' + foundRoute.pathParameterString + '))');
            }
            addLine('.send(common.generateDataFromSchema(router.metadata.schemas.updateStatus))');
            addLine(".set(common.authentication({user: config.get('tests').adminUser}))");
            addLine('.expect(common.success(204))');
            addLine('.end(common.logResponse(done));');
            indent--;
            indent--;
            addLine('});');
        }

        function addNoAuth() {
            addLine("it('No Authentication', function (done) {");
            indent++;
            addLine("common.request.put('" + foundRoute.fullPath + "')");
            indent++;
            if (foundRoute.hasPathParameters) {
                addLine('.use(common.urlTemplate(' + foundRoute.pathParameterString + '))');
            }
            addLine('.send(common.generateDataFromSchema(router.metadata.schemas.updateStatus))');
            addLine('.expect(common.error(401))');
            addLine('.end(common.logResponse(done));');
            indent--;
            indent--;
            addLine('});');
        }

        function addNoData() {
            addLine("it('No Data', function (done) {");
            indent++;
            addLine("common.request.put('" + foundRoute.fullPath + "')");
            indent++;
            if (foundRoute.hasPathParameters) {
                addLine('.use(common.urlTemplate(' + foundRoute.pathParameterString + '))');
            }
            addLine('.send({})');
            addLine(".set(common.authentication({user: config.get('tests').adminUser}))");
            addLine('.expect(common.error(400))');
            addLine('.end(common.logResponse(done));');
            indent--;
            indent--;
            addLine('});');
        }
    }

    function addDelete(foundRoute) {
        addHappy();
        addNoAuth();
        addNotFound();
        function addHappy() {
            addLine("it('Happy case', function (done) {");
            indent++;
            addLine("common.request.delete('" + foundRoute.fullPath + "')");
            indent++;
            if (foundRoute.hasPathParameters) {
                addLine('.use(common.urlTemplate(' + foundRoute.pathParameterString + '))');
            }
            addLine(".set(common.authentication({user: config.get('tests').adminUser}))");
            addLine('.expect(common.success(204))');
            addLine('.end(common.logResponse(done));');
            indent--;
            indent--;
            addLine('});');
        }

        function addNoAuth() {
            addLine("it('No Authentication', function (done) {");
            indent++;
            addLine("common.request.delete('" + foundRoute.fullPath + "')");
            indent++;
            if (foundRoute.hasPathParameters) {
                addLine('.use(common.urlTemplate(' + foundRoute.pathParameterString + '))');
            }
            addLine('.expect(common.error(401))');
            addLine('.expect(common.matchesSwaggerSchema)');
            addLine('.end(common.logResponse(done));');
            indent--;
            indent--;
            addLine('});');
        }

        function addNotFound() {
            addLine("it('Invalid path parameter', function (done) {");
            indent++;
            addLine("common.request.delete('" + foundRoute.fullPath + "')");
            indent++;
            addLine(
                '.use(common.urlTemplate(' +
                    JSON.stringify(getPathParameterObject(foundRoute, { fake: true })) +
                    '))'
            );
            addLine(".set(common.authentication({user: config.get('tests').adminUser}))");
            addLine('.expect(common.error(404))');
            addLine('.expect(common.matchesSwaggerSchema)');
            addLine('.end(common.logResponse(done));');
            indent--;
            indent--;
            addLine('});');
        }
    }

    function getFullPath(foundRoute) {
        let url = (data.routePrefix || '') + foundRoute.path;
        if (_.endsWith(url, '/')) {
            url = url.substr(0, url.length - 1);
        }
        return url;
    }

    function getPathParameterObject(foundRoute, options) {
        options = options || {};
        foundRoute.parameters = foundRoute.parameters || [];
        const pathParams = foundRoute.parameters.filter(param => {
            return param.in === 'path';
        });
        if (data.routePrefix.indexOf(':') >= 0) {
            const urlParts = data.routePrefix.split('/').filter(function(urlPart) {
                return urlPart.indexOf(':') >= 0;
            });
            urlParts.forEach(function(urlPart) {
                pathParams.push({ name: urlPart.replace(':', '') });
            });
        }
        const result = {};
        pathParams.forEach(function(pathParam) {
            if (options.fake) {
                result[pathParam.name] = uuid.v4();
                return;
            }
            const paramValue = data.pathParameters[pathParam.name];
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
    let outputContent = '';
    indentLevel = indentLevel || 0;
    for (let i = 0; i < indentLevel; i++) {
        outputContent += indentationTemplate;
    }
    outputContent += line + eol;
    return outputContent;
}
