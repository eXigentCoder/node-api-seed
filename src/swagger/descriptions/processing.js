'use strict';
module.exports = function (options) {
    return {
        security: true,
        summary: "Posts Through " + options.aOrAn + " " + options.title + " To Be Processed.",
        tags: [options.title],
        common: {
            responses: ["500", "400", "401"],
            parameters: {
                header: ["X-Request-Id"]
            }
        },
        parameters: [
            {
                name: options.name,
                description: "The " + options.title.toLowerCase() + " to be processed.",
                required: true,
                in: "body",
                model: options.schemas.creation.name
            }
        ],
        responses: {
            "202": {
                description: 'Informs the caller that the ' + options.title.toLowerCase()
                + ' was successfully submitted to the server in order to be processed asynchronously.',
                commonHeaders: ["X-Request-Id"]
            }
        }
    };
};