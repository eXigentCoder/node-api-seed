'use strict';
var schema = require('./user.json');
var bcrypt = require('bcrypt');
var config = require("nconf");
var items = require('./items');
var generatePassword = require('password-generator');
var router = require('../../crud/router')({
    schema: schema
});
require('../../crud/router/add-standard-routes')(router);
router.crudMiddleware = require('../../mongo/crud')(router.metadata);
module.exports = router;

router.getByIdAndUse('/items', items)
    .query()
    .getById()
    .create({
        addAfter: {
            'addVersionInfo': createPassword
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