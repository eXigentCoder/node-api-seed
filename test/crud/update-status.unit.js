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

        it('Should use the updateStatus schema if one was specified', function() {
            const fakeUpdateSchema = { $id: 'test-update-schema', bob: true };
            const spy = sinon.spy(validator, 'addSchema');
            updateStatusFunctions.addUpdateStatusRoute(fakeRouter(['ssd'], fakeUpdateSchema), fakeCrudMiddleware());
            assert(spy.calledWith(fakeUpdateSchema));
        });
    });
});

function fakeRouter(statuses, updateStatusSchema) {
    const router = {
        metadata: {
            schemas: {
                core: {}
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
