'use strict';
var common = require('../@util/integration-common');
var async = require('async');
var roles = require('../../src/roles');
var mongo = require('mongodb');

var userId = '580d9f45622d510b044fb6a8';
var resource = 'items';
var permissions = ['view'];

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
            roles.nodeAcl.addUserRoles(userId, permissions, callback);
        }


        function checkResources(callback) {
            roles.nodeAcl.whatResources('member', function (err, resources) {
                if (err) {
                    return callback(err);
                }
                var expected = {
                    users: [
                        "view"
                    ],
                    items: [
                        "view"
                    ]
                };
                expect(resources).to.deep.equal(expected);
                return callback();
            });
        }

        function checkPerms(callback) {
            roles.nodeAcl.allowedPermissions(userId, resource, permsChecked);

            function permsChecked(err, permsChecked) {
                if (err) {
                    return callback(err);
                }
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
