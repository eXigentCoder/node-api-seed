'use strict';
var _ = require('lodash');
var schema = require('./item.json');
var output = require('./item-output.json');
output = _.merge({}, schema, output);
var router = require('../../../swagger/router')({
    schemas: {
        core: schema,
        output: output
    }
});
var crudMiddleware = require('../../../mongo/crud')(router.metadata);
module.exports = router;
router.add.query({
    crudMiddleware: crudMiddleware,
    maps: {
        addBefore: {
            'query': filterOwner
        }
    }
});
router.add.getById({
    crudMiddleware: crudMiddleware,
    maps: {
        addBefore: {
            'findByIdentifier': filterOwner
        }
    }
});
router.add.create({crudMiddleware: crudMiddleware});
router.add.update({crudMiddleware: crudMiddleware});


function filterOwner(req, res, next) {
    req.query = req.query || {};
    req.query.ownerId = req.process.user._id;
    return next();
}