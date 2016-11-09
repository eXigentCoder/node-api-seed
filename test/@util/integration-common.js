'use strict';
require('./init.js');
var createApp = require('../../src/app.js');
var async = require('async');
var request = require('supertest');
var expect = require('./expect');
var set = require('./set');
var dropAndRecreate = require('../@data/drop-and-recreate');
var initialised = false;
before(function (done) {
    if (initialised) {
        return process.nextTick(done);
    }
    initialised = true;
    this.timeout(10000);
    async.waterfall([
        createApp,
        createDataObject,
        dropAndRecreate,
        expect.initialise
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

function createDataObject(app, callback) {
    var data = {
        app: app
    };
    return callback(null, data);
}

after(function (done) {
    //add any cleanup logic here
    console.verbose('Tests Done');
    done();
});

module.exports = {
    defaultTimeout: 5000,
    app: null
};

Object.keys(expect).forEach(function (key) {
    if (module.exports[key]) {
        throw new Error("Can't add a the property " + key + " to module.exports because it already exists");
    }
    module.exports[key] = expect[key];
});

Object.keys(set).forEach(function (key) {
    if (module.exports[key]) {
        throw new Error("Can't add a the property " + key + " to module.exports because it already exists");
    }
    module.exports[key] = set[key];
});