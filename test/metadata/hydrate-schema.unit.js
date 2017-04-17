'use strict';
require('../@util/init.js');
const hydrateSchema = require('../../src/metadata/hydrate-schema');

describe('hydrateSchema spec', function () {
    describe('_id property', function () {
        it("should add the property if it doesn't exist", function () {
            const schema = {};
            hydrateSchema(schema);
            expect(schema.properties._id).to.be.ok();
            expect(schema.properties._id).to.be.an('object');
        });
        it("should merge the property if it does exist", function () {
            const schema = {
                properties: {
                    _id: {
                        format: "",
                        mongoId: false,
                        myCoolExtraProperty: true
                    }
                }
            };
            hydrateSchema(schema);
            expect(schema.properties._id).to.be.ok();
            expect(schema.properties._id).to.be.an('object');
            expect(schema.properties._id.myCoolExtraProperty).to.be.ok();
            expect(schema.properties._id.format).to.equal('');
            expect(schema.properties._id.mongoId).to.equal(false);
        });
    });
});
