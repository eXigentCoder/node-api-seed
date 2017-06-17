const schema = require('./item.json');
const router = require('../../../crud/router')({
    schemas: {
        core: schema
    }
});
router.crudMiddleware = require('../../../mongo/crud')(router.metadata);
require('../../../crud/router/add-standard-routes')(router);
module.exports = router;

const filterOwnerMap = {
    addBeforeIfExists: {
        query: filterOwner,
        findByIdentifier: filterOwner
    }
};

router.query(filterOwnerMap).getById(filterOwnerMap).create().update().deleteById(filterOwnerMap);

function filterOwner(req, res, next) {
    req.query = req.query || {};
    req.query.owner = req.process.user._id;
    return next();
}
