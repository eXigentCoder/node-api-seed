'use strict';

var schema = require('./item.json');
var router = require('../../../swagger/router')({
    schema: schema
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