'use strict';
var _ = require('lodash');
module.exports = function (options) {
    return {
        security: true,
        summary: "Updates the status of a " + options.title + " By " + _.startCase(options.identifierName),
        tags: [options.tag.name],
        parameters: [
            {
                name: options.identifierName.toLowerCase(),
                description: "The field to uniquely identify this " + options.title.toLowerCase(),
                required: true,
                in: "path",
                type: "string"
            },
            {
                name: "statusData",
                description: "Any data you would like to store, associated with the status update.",
                required: false,
                in: "body",
                schema: {}
            }
        ],
        common: {
            responses: ["500", "400", "401", "404"],
            parameters: {
                header: ["X-Request-Id"]
            }
        },
        responses: {
            "204": {
                description: "Lets the calling system know that the request was successful",
                commonHeaders: ["X-Request-Id"]
            }
        }
    };
};