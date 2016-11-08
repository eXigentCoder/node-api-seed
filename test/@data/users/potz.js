'use strict';
var ObjectId = require('mongodb').ObjectId;
var bcrypt = require('bcrypt');
var config = require('nconf');

module.exports = function (callback) {
    bcrypt.hash('12345678', config.get('passwordOptions').saltRounds, hashCalculated);

    function hashCalculated(err, hash) {
        if (err) {
            return callback(err);
        }
        var user = {
            _id: ObjectId("580d9f45622d510b044fb6a8"),
            email: "potz666@gmail.com",
            firstName: "Ryan",
            surname: "Kotzen",
            passwordHash: hash
        };
        return callback(null, user);
    }
};