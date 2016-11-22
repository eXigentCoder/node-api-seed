'use strict';
var _ = require('lodash');
var schema = require('./item.json');
var moment = require('moment');
var router = require('../../../crud/router')({
    schemas: {
        core: schema,
        output: _.merge({}, schema, require('./item-output.json'))
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
var setOwnerFromPathMap = {
    replace: {
        'setOwnerIfApplicable': setOwnerFromPath
    }
};

router.query(filterOwnerMap)
    .getById(filterOwnerMap)
    .create(setOwnerFromPathMap)
    .update()
    .deleteById(filterOwnerMap);


function filterOwner(req, res, next) {
    req.query = req.query || {};
    req.query.owner = req.process.user._id;
    return next();
}

function setOwnerFromPath(req, res, next) {
    req.body.owner = req.process.user._id;
    req.body.ownerDate = moment.utc().toDate();
    req.body.ownerLog = [{
        owner: req.body.owner,
        data: null,
        ownerDate: req.body.ownerDate
    }];
    return next();
}