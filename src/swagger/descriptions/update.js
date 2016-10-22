'use strict';
var _ = require('lodash');
module.exports = function (options) {
    return {
        security: true,
        summary: "Updates a " + options.title + " By " + _.startCase(options.identifierName),
        tags: [options.tag.name],
        parameters: [
            {
                name: options.identifierName.toLowerCase(),
                description: "The field to uniquely identify this " + options.title.toLowerCase() + ".",
                required: true,
                in: "path",
                type: "string"
            }
        ],
        common: {
            responses: ["500", "400", "401", "404"],
            parameters: {
                header: ["X-Request-Id"]
            }
        },
        responses: {
            "200": {
                description: "Returns the single, updated " + options.title + " matching the parameters.",
                model: options.schemas.output.name,
                commonHeaders: ["X-Request-Id"]
            }
        }
    };
};