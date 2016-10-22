'use strict';
var express = require('express');
var config = require('nconf');
var routerOptions = config.get('expressApp').routerOptions;
var router = express.Router(routerOptions);
var boom = require('boom');

module.exports = router;

router.get('/server', function (req, res, next) {
    return next(boom.badImplementation('Server error - should not see details'));
});

router.get('/client', function (req, res, next) {
    return next(boom.badRequest('Client error - should see details'));
});

const uncaughtErrorMessage = "Testing the uncaught process error, should kill the server, don't expose on live";
router.get('/process', function () {
    process.nextTick(function () {
        throw new Error(uncaughtErrorMessage);
    });
});
module.exports._uncaughtErrorMessage = uncaughtErrorMessage;

