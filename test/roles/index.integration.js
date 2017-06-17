const common = require('../@util/integration-common');
const async = require('async');
const permissions = require('../../src/permissions');
const mongo = require('mongodb');

const userId = '580d9f45622d510b044fb703';
const resource = 'items';
const permissionsToAssign = ['getById'];
const role = 'member';

describe('Test access control lists', function() {
    this.timeout(common.defaultTimeout);
    it('Happy - Should be allowed', function(done) {
        async.waterfall([addUserRoles, checkAllowed], done);

        function addUserRoles(callback) {
            permissions.nodeAcl.addUserRoles(userId, role, callback);
        }

        function checkAllowed(callback) {
            const middleware = permissions.checkRoleOnly(resource, permissionsToAssign);
            const req = {
                user: {
                    _id: mongo.ObjectId(userId)
                }
            };
            const res = {};
            const next = function(err) {
                return callback(err);
            };
            middleware(req, res, next);
        }
    });
});
