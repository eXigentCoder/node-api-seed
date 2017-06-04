'use strict';
const schema = require('./user.json');
const bcrypt = require('bcrypt');
const config = require('nconf');
const items = require('./items');
const generatePassword = require('password-generator');
const permissions = require('../../permissions');
const boom = require('boom');
const router = require('../../crud/router')({
    schemas: {
        core: schema
    }
});
router.crudMiddleware = require('../../mongo/crud')(router.metadata);
require('../../crud/router/add-standard-routes')(router);
module.exports = router;

router
    .getByIdAndUse('/items', items)
    .query()
    .getById()
    .create({
        addAfter: {
            addVersionInfo: [createPassword, addUserRoles]
        }
    })
    .update()
    .updateStatus();

function createPassword(req, res, next) {
    const randomPw = generatePassword(18, false);
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
    const roleToSet = req.body.role || 'member';
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
            return next(boom.forbidden('Only admins can add other admin users.'));
        }
        permissions.nodeAcl.addUserRoles(req.user._id.toString(), roleToSet, next);
    }
}
