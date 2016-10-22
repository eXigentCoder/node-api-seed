'use strict';

module.exports = function (options) {
    return {
        security: true,
        summary: "Posts Through " + options.aOrAn + " " + options.title + " To Be Created.",
        tags: [options.tag.name],
        common: {
            responses: ["500", "400", "401"],
            parameters: {
                header: ["X-Request-Id"]
            }
        },
        parameters: [
            {
                name: options.name,
                description: "The " + options.title.toLowerCase() + " to be created.",
                required: true,
                in: "body",
                model: options.schemas.creation.name
            }
        ],
        responses: {
            "201": {
                description: 'Informs the caller that the ' + options.title.toLowerCase() + ' was successfully created.',
                commonHeaders: ["X-Request-Id"],
                model: options.schemas.output.name
            }
        }
    };
};