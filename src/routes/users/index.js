'use strict';
var schema = require('./user.json');
var bcrypt = require('bcrypt');
var config = require("nconf");
var items = require('./items');
var generatePassword = require('password-generator');
var roles = require('../../roles');
var router = require('../../crud/router')({
    schemas: {
        core: schema
    }
});
router.crudMiddleware = require('../../mongo/crud')(router.metadata);
require('../../crud/router/add-standard-routes')(router);
module.exports = router;

router.getByIdAndUse('/items', items)
    .query()
    .getById()
    .create({
        addAfter: {
            'addVersionInfo': [createPassword, addUserRoles]
        }
    })
    .update()
    .updateStatus();

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

function addUserRoles(req, res, next) {
    roles.addUserRoles(req.user._id.toString(), 'member', next);
}
