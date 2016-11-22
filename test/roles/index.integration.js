'use strict';
var common = require('../@util/integration-common');
var async = require('async');
var permissions = require('../../src/permissions');
var mongo = require('mongodb');

var userId = '580d9f45622d510b044fb703';
var resource = 'items';
var permissionsToAssign = ['getById'];
var role = 'member';

describe('Test access control lists', function () {
    this.timeout(common.defaultTimeout);
    it('Happy - Should be allowed', function (done) {
        async.waterfall([
            addUserRoles,
            checkAllowed
        ], done);

        function addUserRoles(callback) {
            permissions.nodeAcl.addUserRoles(userId, role, callback);
        }

        function checkAllowed(callback) {
            var middleware = permissions.ensureHasPermissionsForResource(resource, permissionsToAssign);
            var req = {
                user: {
                    _id: mongo.ObjectId(userId)
                }
            };
            var res = {};
            var next = function (err) {
                return callback(err);
            };
            middleware(req, res, next);
        }
    });
});
