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
var creationMaps = {
    addBefore: {
        'query': filterOwner
    }
};
router.add.query({crudMiddleware: crudMiddleware, maps: creationMaps});
router.add.getById({crudMiddleware: crudMiddleware});
router.add.create({crudMiddleware: crudMiddleware});
router.add.update({crudMiddleware: crudMiddleware});


function filterOwner(req, res, next) {
    req.query = req.query || {};
    req.query.ownerId = req.process.user._id;
    return next();
}