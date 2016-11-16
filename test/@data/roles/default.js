'use strict';
var ObjectId = require('mongodb').ObjectId;
var config = require('nconf');
var moment = require('moment');
var roles = require('../../../src/roles/roles.js');
var async = require('async');
var express = require('express');
var nodeAcl = require('acl');
var mongo = require('../../../src/mongo');

var dbInstance = mongo;
var prefix = 'acl';

nodeAcl = new nodeAcl(new nodeAcl.mongodbBackend(dbInstance, prefix));


var defaultUser = config.get('tests').defaultUser;
var user = {
    _id: ObjectId('580d9f45622d510b044fb6a8'),
    email: defaultUser.email,
    firstName: 'Ryan',
    surname: 'Kotzen',
    //passwordHash: hash,
    role: 'member',
    versionInfo: {
        dateCreated: moment.utc().toDate(),
        //versionTag: uuid.v4(),
        dateUpdated: moment.utc().toDate(),
        createdBy: ObjectId("580d9f45622d510b044fb6a8"),
        lastUpdatedBy: ObjectId("580d9f45622d510b044fb6a8")
    }
  };

module.exports = function (callback) {
    async.waterfall([
        addUserRoles,
        resourceAllow,
        checkAllowed
    ], callback);
};


function addUserRoles(req,res,next){
    roles.addUserRoles('580d9f45622d510b044fb6a8', ['member'],function(error,added){
      if (added) {
        console.log('Added');
        return;
      }else{
        console.log('Not Added error = '+ error + ' --> '+added);
        return;
      }
    });
}

function resourceAllow(req, res, next) {
  roles.allow('member',['users','items'],'view');
  roles.allow('admin', ['users','items'],'*');
}

function checkAllowed(req, res, next) {
   roles.isAllowed(req.userId, url, permission, function(error, isAllowed) {
      if (isAllowed) {
          next();
      }
      else
      {
         return next(boom.unauthorized());
       }
   })
 }
