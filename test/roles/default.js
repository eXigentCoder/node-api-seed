'use strict';
var async = require('async');
var roles = require('../../src/roles');
var mongo = require('mongodb');
var userId = '580d9f45622d510b044fb6a8';
var resource = 'items';
var permissions = ['view'];

module.exports = function (callback) {
    async.waterfall([
        addUserRoles,
        checkResources,
        checkPerms,
        checkAllowed
    ], callback);
};

function addUserRoles(callback) {
    roles.addUserRoles(userId, permissions, callback);
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

function checkResources(callback) {
    var middleware = roles.checkResources('member');
    var req = {
    };
    var res = {};
    var next = function (err) {
        return callback(err);
    };
    middleware(req, res, next);
}

function checkPerms(callback) {
    var middleware = roles.checkPerms(resource);
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
