'use strict';
var common = require('../@util/integration-common');
var async = require('async');
var roles = require('../../src/roles');
var mongo = require('mongodb');

var userId = '580d9f45622d510b044fb703';
var resource = 'items';
var permissions = ['view'];
var role = 'member';

describe('Test access control lists', function () {
    this.timeout(common.defaultTimeout);
    it('Happy - Should be allowed', function (done) {
        async.waterfall([
            addUserRoles,
            checkResources,
            checkPerms,
            checkAllowed
        ], done);

        function addUserRoles(callback) {
            roles.nodeAcl.addUserRoles(userId, role, callback);
        }


        function checkResources(callback) {
            roles.nodeAcl.whatResources(role, function (err, resources) {
                if (err) {
                    return callback(err);
                }
                var expected = {
                    users: permissions,
                    items: permissions
                };
                expect(resources).to.deep.equal(expected);
                return callback();
            });
        }

        function checkPerms(callback) {
            roles.nodeAcl.allowedPermissions(userId, resource, permsChecked);

            function permsChecked(err, allowedPermissions) {
                if (err) {
                    return callback(err);
                }
                var expectedPermissions = {items: permissions};
                expect(allowedPermissions).to.deep.equal(expectedPermissions);
                return callback();
            }
        }

        function checkAllowed(callback) {
            var middleware = roles.checkRole(resource, permissions);
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
