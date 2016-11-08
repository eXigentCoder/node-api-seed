'use strict';
var ObjectId = require('../../../src/mongo/index').ObjectId;
var bcrypt = require('bcrypt');
var password = '12345678';
var saltRounds = 10;

module.exports = function (callback) {
    bcrypt.hash(password, saltRounds, hashCalculated);

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