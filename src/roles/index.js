'use strict';
var NodeAcl = require('acl');
var boom = require('boom');
var mongo = require('../mongo');
var nodeAcl = null;
var async = require('async');
var util = require('util');

module.exports = {
    initialise: initialise,
    checkRole: checkRole,
    nodeAcl: null
};

function initialise(app, callback) {
    if (nodeAcl !== null) {
        return process.nextTick(function () {
            callback(null, app);
        });
    }
    var prefix = 'acl-';
    nodeAcl = new NodeAcl(new NodeAcl.mongodbBackend(mongo.db, prefix));
    module.exports.nodeAcl = nodeAcl;
    async.parallel([
        nodeAcl.allow.bind(nodeAcl, 'member', ['users', 'items'], 'view'),
        nodeAcl.allow.bind(nodeAcl, 'admin', ['users', 'items'], '*')
    ], function (err) {
        return callback(err, app);
    });
}

function checkRole(resource, permissions) {
    return function (req, res, next) {
        var userIdString = req.user._id.toString();
        nodeAcl.isAllowed(userIdString, resource, permissions, roleChecked);

        function roleChecked(err, isAllowed) {
            if (err) {
                return next(err);
            }
            if (isAllowed) {
                return next();
            }
            return next(boom.forbidden(util.format('User %s does not have all of the required permissions (%j) to access the "%s" resource.', userIdString, permissions, resource)));
        }
    };
}