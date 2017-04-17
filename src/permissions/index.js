'use strict';
const NodeAcl = require('acl');
const boom = require('boom');
const mongo = require('../mongo');
let nodeAcl = null;
const util = require('util');
const _ = require('lodash');
const messageTemplate = 'User %s does not have all of the required permissions %j to perform this action on the "%s" resource.';
const rules = require('./rules.json');
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
    const prefix = 'acl-';
    nodeAcl = new NodeAcl(new NodeAcl.mongodbBackend(mongo.db, prefix));
    module.exports.nodeAcl = nodeAcl;
    let aclRules = rules;
    if (app && app.aclRules) {
        aclRules = app.aclRules;
    }
    nodeAcl.allow(aclRules, function (err) {
        console.log("Permissions initialised");
        return callback(err, app);
    });
}

function checkRoleOnly(resource, permissions) {
    return function (req, res, next) {
        if (!_.isArray(permissions)) {
            permissions = [permissions];
        }
        const userIdString = req.user._id.toString();
        nodeAcl.isAllowed(userIdString, resource, permissions, roleChecked);

        function roleChecked(err, isAllowed) {
            if (err) {
                return next(err);
            }
            if (isAllowed) {
                return next();
            }
            return next(boom.forbidden(util.format(messageTemplate, userIdString, permissions, resource)));
        }
    };
}

function checkRoleAndOwner(resource, permissions, ownership) {
    return function (req, res, next) {
        if (!_.isArray(permissions)) {
            permissions = [permissions];
        }
        const userIdString = req.user._id.toString();
        const missingPermissionsErrorMessage = util.format(messageTemplate, userIdString, permissions, resource);
        nodeAcl.isAllowed(userIdString, resource, permissions, roleChecked);

        function roleChecked(err, isAllowed) {
            if (err) {
                return next(err);
            }
            if (isAllowed) {
                return next();
            }
            if (!ownership || ownership.doNotTrack || !ownership.permissions) {
                return next(boom.forbidden(missingPermissionsErrorMessage));
            }
            //check if ownership confers the permission:
            permissions.forEach(function (permission) {
                if (ownership.permissions.indexOf(permission) < 0) {
                    return next(boom.forbidden(missingPermissionsErrorMessage));
                }
            });
            //ensure there is an owner
            let owner = req.body.owner;
            if (req.process.metadataFields) {
                owner = req.process.metadataFields.owner;
            }
            if (!owner) {
                return next(boom.badImplementation("Owner was null, make sure you have called getExistingMetadata first"));
            }
            //check if owner matches current user
            if (userIdString !== owner.toString()) {
                return next(boom.forbidden(missingPermissionsErrorMessage));
            }
            return next();
        }
    };
}

function checkRoleAndOwnerToSetQuery(resource, permissions, ownership) {
    return function (req, res, next) {
        if (!_.isArray(permissions)) {
            permissions = [permissions];
        }
        const userIdString = req.user._id.toString();
        nodeAcl.isAllowed(userIdString, resource, permissions, roleChecked);
        const message = util.format(messageTemplate, userIdString, permissions, resource);

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
