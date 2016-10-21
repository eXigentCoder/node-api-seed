'use strict';
require('./init.js');
var createApp = require('../src/app.js');
var async = require('async');
var request = require('supertest');

before(function (done) {
    this.timeout(10000);
    async.waterfall([
        createApp,
        createDataObject
        //clean db
        //setup initial data
    ], waterfallComplete);

    function waterfallComplete(err, data) {
        if (err) {
            return done(err);
        }
        module.exports.app = data.app;
        module.exports.request = request(data.app);
        done();
    }
});

after(function (done) {
    //add any cleanup logic here
    console.verbose('Tests Done');
    done();
});

module.exports = {
    defaultTimeout: 5000
};

function createDataObject(app, callback) {
    var data = {
        app: app
    };
    return callback(null, data);
}