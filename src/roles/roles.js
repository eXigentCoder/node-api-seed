'use strict';
var nodeAcl = require('acl');
var boom = require('boom');
var mongo = require('../mongo');
//var mongo = require("../../src/mongo/index");
module.exports = {addUserRoles};

var dbInstance = mongo;
var prefix = 'acl';

nodeAcl = new nodeAcl(new nodeAcl.mongodbBackend(dbInstance, prefix));

function resourceAllow(req, res, next) {
  nodeAcl.allow('member',['users','items'],'view');
  nodeAcl.allow('admin', ['users','items'],'*');
}

function checkAllowed(req, res, next) {
  console.log('userId = '+req.userId);
   nodeAcl.isAllowed(req.userId, url, permission, function(error, isAllowed) {
      if (isAllowed) {
          next();
      }
      else
      {
         return next(boom.unauthorized());
      }
   })
 }

function addUserRoles(req, res, next) {
    //nodeAcl.addUserRoles(req.userId, req.role);
    nodeAcl.addUserRoles('580d9f45622d510b044fb6a8', ['member'],function(error,added){
      if (added) {
        console.log('Added');
        next();
      }else{
        console.log('Not Added2 error='+error+' --> '+added);
        return next();
      }
      });
}
