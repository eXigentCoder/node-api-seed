'use strict';
var express = require('express');
var router = express.Router();
var config = require('nconf');

router.get('/server', function (req, res, next) {
    return next(new Error('Server error - should not see details'));
});

router.get('/client', function (req, res, next) {
    var err = new Error('Client error - should see details');
    err.status = 400;
    return next(err);
});

if (config.get('NODE_ENV') === 'development') {
    router.get('/process', function () {
        process.nextTick(function () {
            throw new Error("Testing the uncaught process error, should kill the server, don't expose on live");
        });
    });
}

module.exports = router;