require('../@util/init.js');
const updateStatusFunctions = require('../../src/crud/update-status');
const mockRequest = require('../@util/request-mocking').mockRequest;
const moment = require('moment');
const sinon = require('sinon');
const validator = require('../../src/validate/validator');

describe('Crud - updateStatus', function() {
    describe('addUpdateStatusRoute', function() {
        it('Should throw an error if the core schema does not have a status object', function() {
            expect(function() {
                updateStatusFunctions.addUpdateStatusRoute(fakeRouter());
            }).to.throw(/No statuses defined/i);
        });

        it('Should throw an error if the core schema has a status value that is not an array', function() {
            expect(function() {
                updateStatusFunctions.addUpdateStatusRoute(fakeRouter({}));
            }).to.throw(/must be an array/i);
        });

        it('Should throw an error if the core schema has a status value that is an array but is empty', function() {
            expect(function() {
                updateStatusFunctions.addUpdateStatusRoute(fakeRouter([]));
            }).to.throw(/must have at least one item in it/i);
        });

        it('Should throw an error if the items in the status array are not objects', function() {
            expect(function() {
                updateStatusFunctions.addUpdateStatusRoute(fakeRouter(['ssd']));
            }).to.throw(/must be an object/i);
        });

        it('Should throw an error if the items in the status array are not objects with a name property on them', function() {
            expect(function() {
                updateStatusFunctions.addUpdateStatusRoute(fakeRouter([{}]));
            }).to.throw(/must have a property called "name"/i);
        });

        it('Should throw an error if the items in the status array are not objects with a name property on them that is a string', function() {
            expect(function() {
                updateStatusFunctions.addUpdateStatusRoute(fakeRouter([{ name: 1 }]));
            }).to.throw(/must be a string/i);
        });

        const addSchemaSpy = sinon.spy(validator, 'addSchema');
        it('Should use the updateStatus schema if one was specified', function() {
            const fakeUpdateSchema = { $id: 'test-update-schema', bob: true };
            updateStatusFunctions.addUpdateStatusRoute(
                fakeRouter([{ name: 'test' }], fakeUpdateSchema),
                fakeCrudMiddleware()
            );
            assert(addSchemaSpy.calledWith(fakeUpdateSchema));
        });

        it('Should use the updateStatusSchema value on the core schema if there was no updateStatus schema spcified', function() {
            const fakeUpdateSchema = { $id: 'test-update-schema', bob: true };
            const router = fakeRouter([{ name: 'test' }], null);
            router.metadata.schemas.core.updateStatusSchema = fakeUpdateSchema;
            updateStatusFunctions.addUpdateStatusRoute(router, fakeCrudMiddleware());
            assert(addSchemaSpy.calledWith(fakeUpdateSchema));
        });

        it('Should use the updateStatus schema if both it and updateStatusSchema were set', function() {
            const fakeUpdateSchema = { $id: 'test-update-schema', bob: true };
            const fakeUpdateSchema2 = { $id: 'test-update-schema2', bob: true };
            const router = fakeRouter([{ name: 'test' }], fakeUpdateSchema);
            router.metadata.schemas.core.updateStatusSchema = fakeUpdateSchema2;
            updateStatusFunctions.addUpdateStatusRoute(router, fakeCrudMiddleware());
            assert(addSchemaSpy.calledWith(fakeUpdateSchema));
        });

        it('Should throw an error if both the updateStatus schema and updateStatusSchema were not set', function() {
            expect(function() {
                updateStatusFunctions.addUpdateStatusRoute(fakeRouter([{ name: 'test' }]));
            }).to.throw(/No update status schema set./i);
        });

        it('Should use the specific status schema if one was specified', function() {
            const fakeUpdateSchema = { $id: 'test-update-schema', bob: true };
            const statuses = [
                {
                    name: 'test',
                    schema: fakeUpdateSchema
                }
            ];
            const router = fakeRouter(statuses);
            updateStatusFunctions.addUpdateStatusRoute(router, fakeCrudMiddleware());
            assert(addSchemaSpy.calledWith(fakeUpdateSchema));
        });

        it('should thrown an error if neither updateStatus or updateStatusSchema were set and not every status specifies its own schema', function() {
            const fakeUpdateSchema = { $id: 'test-update-schema', bob: true };
            const statuses = [
                {
                    name: 'test',
                    schema: fakeUpdateSchema
                },
                {
                    name: 'test2'
                }
            ];
            const router = fakeRouter(statuses);
            expect(function() {
                updateStatusFunctions.addUpdateStatusRoute(router, fakeCrudMiddleware());
            }).to.throw(/No update status schema set./i);
        });
    });
});

function fakeRouter(statuses, updateStatusSchema) {
    const router = {
        metadata: {
            schemas: {
                core: {
                    $id: 'fake-core-schema-id'
                }
            },
            updateStatusDescription: 'Fake'
        },
        put: function() {
            return router;
        },
        describe: sinon.stub()
    };
    if (statuses) {
        router.metadata.schemas.core.statuses = statuses;
    }
    if (updateStatusSchema) {
        router.metadata.schemas.updateStatus = updateStatusSchema;
    }
    return router;
}

function fakeCrudMiddleware() {
    return {
        query: sinon.stub(),
        findByIdentifier: sinon.stub(),
        create: sinon.stub(),
        update: sinon.stub(),
        updateStatus: sinon.stub(),
        getExistingMetadata: sinon.stub(),
        writeHistoryItem: sinon.stub(),
        deleteByIdentifier: sinon.stub()
    };
}
