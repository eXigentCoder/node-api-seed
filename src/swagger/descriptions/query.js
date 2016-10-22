'use strict';

module.exports = function (options) {
    return {
        security: true,
        summary: "Search for " + options.titlePlural,
        tags: [options.tag.name],
        common: {
            responses: ["500", "400", "401"],
            parameters: {
                header: ["X-Request-Id"],
                query: ["select", "skip", "limit", "sort", "rawQuery"]
            }
        },
        responses: {
            200: {
                description: 'Returns the list of ' + options.titlePlural + ' matching the supplied parameters.',
                arrayOfModel: options.schemas.output.name,
                commonHeaders: ["X-Request-Id"]
            }
        }
    };
};