const validator = require('./validator');
const boom = require('boom');

module.exports = function(schema) {
    validator.addSchema(schema);
    return function validateSchema(req, res, next) {
        const result = validator.validate(schema, req.body);
        if (!result.valid) {
            return next(
                boom.badRequest(
                    'The data was not in the correct format. ' + result.message,
                    result.errors
                )
            );
        }
        return next();
    };
};
