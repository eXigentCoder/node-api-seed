'use strict';
var schema = require('./user.json');
var router = require('../../swagger/router')({
    schema: schema
});
var middleware = require('../../json-file-db/index')(router.metadata);
router.add.query({crudMiddleware: middleware});
router.add.getById({crudMiddleware: middleware});
router.add.create({crudMiddleware: middleware});
router.add.update({crudMiddleware: middleware});
router.add.updateStatus({crudMiddleware: middleware});
module.exports = router;