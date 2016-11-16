'use strict';
var NodeAcl = require('acl');
var boom = require('boom');
var mongo = require('../mongo');
var nodeAcl = null;
var async = require('async');

module.exports = {
    initialise: initialise,
    checkRole: checkRole,
    nodeAcl: null
};

function initialise(app, callback) {
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
        nodeAcl.isAllowed(req.user._id.toString(), resource, permissions, roleChecked);

        function roleChecked(err, isAllowed) {
            if (err) {
                return next(err);
            }
            if (isAllowed) {
                return next();
            }
            return next(boom.forbidden());
        }
    };
}