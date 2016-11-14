'use strict';

var schema = require('./item.json');
var router = require('../../../swagger/router')({
    schema: schema
});
var crudMiddleware = require('../../../mongo/crud')(router.metadata);
module.exports = router;

router.add.query({crudMiddleware: crudMiddleware});
router.add.getById({crudMiddleware: crudMiddleware});
router.add.create({crudMiddleware: crudMiddleware});
router.add.update({crudMiddleware: crudMiddleware});