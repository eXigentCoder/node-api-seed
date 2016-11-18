'use strict';
var _ = require('lodash');
var schema = require('./item.json');
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
router.crudMiddleware = require('../../../mongo/crud')(router.metadata);
require('../../../crud/router/add-standard-routes')(router);
module.exports = router;

var filterOwnerMap = {
    addBeforeIfExists: {
        'query': filterOwner,
        'findByIdentifier': filterOwner
    }
};
var setOwnerMap = {
    addBefore: {
        'validate': setOwner
    }
};
router.query(filterOwnerMap)
    .getById(filterOwnerMap)
    .create(setOwnerMap)
    .update(setOwnerMap)
    .deleteById(filterOwnerMap);


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