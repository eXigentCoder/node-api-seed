'use strict';
module.exports = function(options) {
    return {
        errorHandling: {
            exposeServerErrorMessages: true,
            exposeErrorRoutes: true
        },
        swagger: {
            writeFile: true,
            appendPortToHost: true
        },
        mongodb: {
            allowDropData: true
        },
        expressApp: {
            jsonSpaces: 4
        }
    };
};
