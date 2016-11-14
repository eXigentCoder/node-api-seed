'use strict';
require('../../config/init-nconf');
var fs = require('fs');
var getSwaggerDataFromRouteStack = require('./get-swagger-route-data');
var eol = require('os').EOL;
var fileOptions = {encoding: 'utf8'};
var indentationTemplate = "    ";
var path = require('path');

(function setInputs() {
    var data = {
        //eslint-disable-next-line global-require
        router: require('../../src/routes/users/index'),
        tagsToGenerateFor: ['User'],
        outputPath: './test/routes/users/generated.js'
    };
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
    addLine("var common = require('" + path.relative(data.outputPath, './test/@util/integration-common.js').replace(/\\/g, '/').replace('../', '') + "');");
    addLine("describe('" + data.router.metadata.titlePlural + "', function(){");
    indent++;
    data.foundRoutes.forEach(function (foundRoute) {
        addLine("describe('" + foundRoute.summary + "', function(){");
        indent++;

        indent--;
        addLine("});");
    });
    indent--;
    addLine("});");
    //eslint-disable-next-line no-sync
    fs.writeFileSync(data.outputPath, outputContent, fileOptions);
    function addLine(line) {
        outputContent += addLineWithIndent(line, indent);
    }
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