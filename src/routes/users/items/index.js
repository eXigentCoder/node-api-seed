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

var setOwnerMap = {
    addBefore: {
        'validate': setOwner
    }
};
router.query(crudMiddleware, {
    addBefore: {
        'query': filterOwner
    }
}).getById(crudMiddleware, {
    addBefore: {
        'findByIdentifier': filterOwner
    }
})
    .create(crudMiddleware, setOwnerMap)
    .update(crudMiddleware, setOwnerMap);


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