'use strict';
var schema = require('./user.json');
var bcrypt = require('bcrypt');
var config = require("nconf");
var items = require('./items');
var generatePassword = require('password-generator');
var permissions = require('../../permissions');
var _ = require('lodash');
var boom = require('boom');
var router = require('../../crud/router')({
    schemas: {
        core: schema,
        creation: _.merge({}, schema, require('./user-creation.json'))
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
    var roleToSet = req.body.role || 'member';
    delete req.body.role;
    if (roleToSet === 'admin') {
        return permissions.nodeAcl.hasRole(req.user._id.toString(), 'admin', hasRoleCheckComplete);
    }
    hasRoleCheckComplete(null, true);

    function hasRoleCheckComplete(err, hasRole) {
        if (err) {
            return next(err);
        }
        if (!hasRole) {
            return next(boom.forbidden("Only admins can add other admin users."));
        }
        permissions.nodeAcl.addUserRoles(req.user._id.toString(), roleToSet, next);
    }
}
