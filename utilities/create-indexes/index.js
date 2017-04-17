'use strict';
const createAllIndexes = require('./create');
const mongo = require('../../src/mongo');
createAllIndexes(function (err) {
    if (err) {
        throw err;
    }
    mongo.close(function (closeErr) {
        if (closeErr) {
            throw closeErr;
        }
        console.log("Indexes successfully created");
    });
});