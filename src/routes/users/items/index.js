'use strict';
var _ = require('lodash');
var schema = require('./item.json');
var addStandardRoutes = require('../../../crud/router/add-standard-routes');
var outputSchema = _.merge({}, schema, require('./item-output.json'));
var inputSchema = buildInputSchema();
var router = require('../../../crud/router')({
    schemas: {
        core: schema,
        output: outputSchema,
        creation: inputSchema,
        update: inputSchema
    }
});
addStandardRoutes(router);
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
var setOwnerMap = {
    addBefore: {
        'validate': setOwner
    }
};
router.add.create({crudMiddleware: crudMiddleware, maps: setOwnerMap});
router.add.update({crudMiddleware: crudMiddleware, maps: setOwnerMap});


function filterOwner(req, res, next) {
    req.query = req.query || {};
    req.query.ownerId = req.process.user._id;
    return next();
}

function setOwner(req, res, next) {
    req.body = req.body || {};
    req.body.ownerId = req.process.user._id.toString();
    return next();
}
function buildInputSchema() {
    var input = _.cloneDeep(schema);
    delete input.properties.ownerId;
    var index = input.required.indexOf('ownerId');
    if (index >= 0) {
        input.required.splice(index, 1);
    }
    return input;
}