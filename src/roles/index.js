'use strict';
var NodeAcl = require('acl');
var boom = require('boom');
var mongo = require('../mongo');
var nodeAcl = {};
var async = require('async');

module.exports = {
    initialise: initialise,
    addUserRoles: addUserRoles,
    checkResources: checkResources,
    checkPerms: checkPerms,
    checkRole: checkRole
};

function addUserRoles(userId, roles, cb) {
    return nodeAcl.addUserRoles(userId, roles, cb);
}

function initialise(app, callback) {
    var prefix = 'acl';
    nodeAcl = new NodeAcl(new NodeAcl.mongodbBackend(mongo.db, prefix));
    //nodeAcl.allow.bind(nodeAcl, {roles:['member','admin'],allows: [{resources:['users', 'items'],permissions: 'view'},{resources:['users', 'items'],permissions: '*'}]})
    async.parallel([
        nodeAcl.allow.bind(nodeAcl, 'member', ['users', 'items'], 'view'),
        nodeAcl.allow.bind(nodeAcl, 'admin', ['users', 'items'], '*')
    ], function (err) {
        console.log('Init Err='+err);
        return callback(err, app);
    });
}

function checkResources(role) {
  return function (req,res,next) {
    nodeAcl.whatResources(role,function(err,resources)
    {
      console.log('role='+role);
        console.log('Resources Err='+err);
      if (err) {
        return next(err);
      }
      console.log('Resources=  %j',resources);
      return next();
    })
  }
}

function checkPerms(resources) {
  return function (req,res,next) {
    nodeAcl.allowedPermissions(req.user._id.toString(),resources,permsChecked);
      console.log('User ='+req.user._id.toString());


      function permsChecked(err, permsChecked) {
                console.log('Perms Err='+err);
          if (err) {
              return next(err);
          }
          console.log('Perms=  %j',permsChecked);
          return next();
      }
    };
  }

function checkRole(resource, permissions) {
    return function (req, res, next) {
        nodeAcl.isAllowed(req.user._id.toString(), resource, permissions, roleChecked);
        console.log('User='+req.user._id.toString());
        console.log('resource='+resource);
        console.log('permissions='+permissions);
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
