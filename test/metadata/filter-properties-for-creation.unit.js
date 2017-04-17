'use strict';
require('../@util/init.js');
const filterPropertiesForCreation = require('../../src/metadata/filter-properties-for-creation');

describe('filterPropertiesForCreation spec', function () {
    describe('_id', function () {
        describe('default behaviour - _id controlled by mongodb', function () {
            it('Should remove the _id as an input property', function () {
                const schema = defaultSchema();
                filterPropertiesForCreation(schema);
                expect(schema).to.be.ok();
                expect(schema.properties._id).to.not.be.ok();
            });
            it('should remove _id from the list of required fields', function () {
                const schema = defaultSchema();
                filterPropertiesForCreation(schema);
                expect(schema).to.be.ok();
                expect(schema.required.includes('_id')).to.be.false();
            });
        });
        describe('Ability to set the _id', function () {
            //todo
        });
    });
    describe('status information', function () {
        describe('status', function () {
            it('should remove statusDate as an input property', function () {
                const schema = defaultSchema();
                filterPropertiesForCreation(schema);
                expect(schema).to.be.ok();
                expect(schema.properties.status).to.not.be.ok();
            });
            it('should remove statusDate as an required field', function () {
                const schema = defaultSchema();
                filterPropertiesForCreation(schema);
                expect(schema).to.be.ok();
                expect(schema.required.includes('status')).to.be.false();
            });
            //todo allow for passing in a status on create sometimes
        });
        describe('statusDate', function () {
            it('should remove statusDate as an input property', function () {
                const schema = defaultSchema();
                filterPropertiesForCreation(schema);
                expect(schema).to.be.ok();
                expect(schema.properties.statusDate).to.not.be.ok();
            });
            it('should remove statusDate as an required field', function () {
                const schema = defaultSchema();
                filterPropertiesForCreation(schema);
                expect(schema).to.be.ok();
                expect(schema.required.includes('statusDate')).to.be.false();
            });
        });
        describe('statusLog', function () {
            it('should remove statusLog as an input property', function () {
                const schema = defaultSchema();
                filterPropertiesForCreation(schema);
                expect(schema).to.be.ok();
                expect(schema.properties.statusLog).to.not.be.ok();
            });
            it('should remove statusLog as an required field', function () {
                const schema = defaultSchema();
                filterPropertiesForCreation(schema);
                expect(schema).to.be.ok();
                expect(schema.required.includes('statusLog')).to.be.false();
            });
        });
    });
    describe('owner information', function () {
        describe('owner', function () {
            it('should remove statusDate as an input property', function () {
                const schema = defaultSchema();
                filterPropertiesForCreation(schema);
                expect(schema).to.be.ok();
                expect(schema.properties.owner).to.not.be.ok();
            });
            it('should remove statusDate as an required field', function () {
                const schema = defaultSchema();
                filterPropertiesForCreation(schema);
                expect(schema).to.be.ok();
                expect(schema.required.includes('owner')).to.be.false();
            });
            //todo allow for passing in an owner?
        });
        describe('ownerDate', function () {
            it('should remove ownerDate as an input property', function () {
                const schema = defaultSchema();
                filterPropertiesForCreation(schema);
                expect(schema).to.be.ok();
                expect(schema.properties.ownerDate).to.not.be.ok();
            });
            it('should remove ownerDate as an required field', function () {
                const schema = defaultSchema();
                filterPropertiesForCreation(schema);
                expect(schema).to.be.ok();
                expect(schema.required.includes('ownerDate')).to.be.false();
            });
        });
        describe('ownerLog', function () {
            it('should remove ownerLog as an input property', function () {
                const schema = defaultSchema();
                filterPropertiesForCreation(schema);
                expect(schema).to.be.ok();
                expect(schema.properties.ownerLog).to.not.be.ok();
            });
            it('should remove ownerLog as an required field', function () {
                const schema = defaultSchema();
                filterPropertiesForCreation(schema);
                expect(schema).to.be.ok();
                expect(schema.required.includes('ownerLog')).to.be.false();
            });
        });
    });
});

function defaultSchema() {
    const statusSchema = {
        type: "string",
        enum: ['a', 'b']
    };
    const dateSchema = {
        type: "string",
        format: "date-time",
        faker: "date.past"
    };
    const mongoIdSchema = {
        type: "string",
        format: "mongoId",
        mongoId: true,
        minLength: 24,
        maxLength: 24
    };
    return {
        type: "object",
        properties: {
            _id: {
                type: "string",
                format: "mongoId",
                mongoId: true,
                minLength: 24,
                maxLength: 24
            },
            status: statusSchema,
            statusDate: dateSchema,
            statusLog: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        status: statusSchema,
                        statusDate: dateSchema,
                        data: {
                            type: 'object'
                        }
                    },
                    required: [
                        'status',
                        'statusDate',
                        'data'
                    ],
                    additionalProperties: false
                },
                additionalItems: false
            },
            owner: mongoIdSchema,
            ownerDate: dateSchema,
            ownerLog: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        owner: mongoIdSchema,
                        ownerDate: dateSchema,
                        data: {
                            type: ["object", "string"]
                        }
                    },
                    required: [
                        'owner',
                        'ownerDate',
                        'data'
                    ],
                    additionalProperties: false
                },
                additionalItems: false
            }
        },
        required: [
            '_id',
            'status',
            'statusDate',
            'statusLog',
            'owner',
            'ownerDate',
            'ownerLog'
        ]
    };
}