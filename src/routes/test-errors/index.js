'use strict';
const express = require('express');
const config = require('nconf');
const routerOptions = config.get('expressApp').routerOptions;
const router = express.Router(routerOptions);
const boom = require('boom');

module.exports = router;

router.get('/server', function(req, res, next) {
    return next(boom.badImplementation('Server error - should not see details'));
});

router.get('/client', function(req, res, next) {
    return next(boom.badRequest('Client error - should see details'));
});

const uncaughtErrorMessage =
    "Testing the uncaught process error, should kill the server, don't expose on live";
router.get('/process', function() {
    process.nextTick(function() {
        throw new Error(uncaughtErrorMessage);
    });
});
module.exports._uncaughtErrorMessage = uncaughtErrorMessage;
