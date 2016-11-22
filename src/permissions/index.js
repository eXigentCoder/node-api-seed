'use strict';
var NodeAcl = require('acl');
var boom = require('boom');
var mongo = require('../mongo');
var nodeAcl = null;
var util = require('util');

module.exports = {
    initialise: initialise,
    checkRoleOnly: checkRoleOnly,
    checkRoleAndOwner: checkRoleAndOwner,
    checkRoleAndOwnerToSetQuery: checkRoleAndOwnerToSetQuery,
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
    var aclRules = [
        {
            roles: ['member'],
            allows: [
                {resources: ['items'], permissions: ['query', 'update', 'updateStatus', 'create', 'deleteById', 'getById']},
                {resources: ['users'], permissions: ['query', 'getById']}
            ]
        }, {
            roles: 'admin',
            allows: [
                {resources: ['users', 'items'], permissions: '*'}
            ]
        }
    ];
    if (app.aclRules) {
        aclRules = app.aclRules;
    }
    nodeAcl.allow(aclRules, function (err) {
        return callback(err, app);
    });
}

function checkRoleOnly(resource, permissions) {
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

function checkRoleAndOwner(resource, permissions, ownership) {
    return function (req, res, next) {
        var userIdString = req.user._id.toString();
        nodeAcl.isAllowed(userIdString, resource, permissions, roleChecked);
        var message = util.format('User %s does not have all of the required permissions (%j) to access the "%s" resource.', userIdString, permissions, resource);

        function roleChecked(err, isAllowed) {
            if (err) {
                return next(err);
            }
            if (isAllowed) {
                return next();
            }
            if (!ownership || ownership.doNotTrack || !ownership.permissions) {
                return next(boom.forbidden(message));
            }
            permissions.forEach(function (permission) {
                if (ownership.permissions.indexOf(permission) < 0) {
                    return next(boom.forbidden(message));
                }
            });
            if (userIdString !== req.body.owner) {
                return next(boom.forbidden(message));
            }
            return next();
        }
    };
}

function checkRoleAndOwnerToSetQuery(resource, permissions, ownership) {
    return function (req, res, next) {
        var userIdString = req.user._id.toString();
        nodeAcl.isAllowed(userIdString, resource, permissions, roleChecked);
        var message = util.format('User %s does not have all of the required permissions (%j) to access the "%s" resource.', userIdString, permissions, resource);

        function roleChecked(err, isAllowed) {
            if (err) {
                return next(err);
            }
            if (isAllowed) {
                return next();
            }
            if (!ownership || ownership.doNotTrack || !ownership.permissions) {
                return next(boom.forbidden(message));
            }
            permissions.forEach(function (permission) {
                if (ownership.permissions.indexOf(permission) < 0) {
                    return next(boom.forbidden(message));
                }
            });
            req.query = req.query || {};
            req.query.owner = req.user._id;
            return next();
        }
    };
}