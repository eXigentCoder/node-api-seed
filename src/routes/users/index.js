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

router.add.query({crudMiddleware: crudMiddleware});
router.getByIdAndUse('/items', items, {crudMiddleware: crudMiddleware});
router.add.getById({crudMiddleware: crudMiddleware});
var creationMaps = {
    addAfter: {
        'addVersionInfo': createPassword
    }
};
router.add.create({crudMiddleware: crudMiddleware, maps: creationMaps});
router.add.update({crudMiddleware: crudMiddleware});
router.add.updateStatus({crudMiddleware: crudMiddleware});

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