'use strict';
var schema = require('./user.json');
var router = require('../../crud/router')({
    schema: schema
});
var addStandardRoutes = require('../../crud/router/add-standard-routes');
addStandardRoutes(router);
var crudMiddleware = require('../../mongo/crud')(router.metadata);
var bcrypt = require('bcrypt');
var config = require("nconf");
var generatePassword = require('password-generator');
var items = require('./items');
module.exports = router;

router.getByIdAndUse('/items', items, {crudMiddleware: crudMiddleware});
var creationMaps = {
    addAfter: {
        'addVersionInfo': createPassword
    }
};
router.query({crudMiddleware: crudMiddleware})
    .getById({crudMiddleware: crudMiddleware})
    .create({crudMiddleware: crudMiddleware, maps: creationMaps})
    .update({crudMiddleware: crudMiddleware})
    .updateStatus({crudMiddleware: crudMiddleware});

function createPassword(req, res, next) {
    var randomPw = generatePassword(18, false);
    bcrypt.hash(randomPw, config.get('authenticationOptions').password.saltRounds, hashCalculated);
    function hashCalculated(err, hash) {
        if (err) {
            return next(err);
        }
        req.body.passwordHash = hash;
        next();
    }
}