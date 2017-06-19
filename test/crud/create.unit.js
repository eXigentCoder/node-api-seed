require('../@util/init.js');
const create = require('../../src/crud/create');
import * as dataFunctions from '../../src/crud/data-mapping/get-data';
const mockRequest = require('../@util/request-mocking').mockRequest;
const moment = require('moment');
const sinon = require('sinon');

describe('Crud - create', function() {
    describe('setStatusIfApplicable', function() {
        it('Should not set req.body.status if the provided schema has no statuses', function(done) {
            const metadata = buildMetadata();
            const middleware = create.setStatusIfApplicable(metadata);
            const reqOptions = {
                body: {}
            };
            mockRequest(middleware, reqOptions, null, next);

            function next(error) {
                expect(error).to.not.be.ok();
                expect(reqOptions.body.status).to.not.be.ok();
                expect(reqOptions.body.statusDate).to.not.be.ok();
                expect(reqOptions.body.statusLog).to.not.be.ok();
                done();
            }
        });

        it('Should set req.body.status to the first status in the schema', function(done) {
            const metadata = buildMetadata([{ name: 'a' }, { name: 'b' }]);
            const middleware = create.setStatusIfApplicable(metadata);
            const reqOptions = {
                body: {}
            };
            mockRequest(middleware, reqOptions, null, next);

            function next(error) {
                expect(error).to.not.be.ok();
                expect(reqOptions.body.status).to.equal('a');
                done();
            }
        });

        it('Should set req.body.statusDate to now', function(done) {
            const metadata = buildMetadata([{ name: 'a' }]);
            const middleware = create.setStatusIfApplicable(metadata);
            const reqOptions = {
                body: {}
            };
            mockRequest(middleware, reqOptions, null, next);

            function next(error) {
                expect(error).to.not.be.ok();
                expect(moment(reqOptions.body.statusDate).diff(new Date())).to.be.lessThan(1);
                done();
            }
        });

        it('Should create a status log with one entry', function(done) {
            const metadata = buildMetadata([{ name: 'a' }]);
            const middleware = create.setStatusIfApplicable(metadata);
            const reqOptions = {
                body: {}
            };
            mockRequest(middleware, reqOptions, null, next);

            function next(error) {
                expect(error).to.not.be.ok();
                expect(reqOptions.body.statusLog).to.be.an('array').that.has.length(1);
                done();
            }
        });

        it('Should create a status log entry with the status set to the first one in the schema', function(
            done
        ) {
            const metadata = buildMetadata([{ name: 'a' }]);
            const middleware = create.setStatusIfApplicable(metadata);
            const reqOptions = {
                body: {}
            };
            mockRequest(middleware, reqOptions, null, next);

            function next(error) {
                expect(error).to.not.be.ok();
                expect(reqOptions.body.statusLog[0].status).to.equal('a');
                done();
            }
        });

        it('Should create a status log entry with the statusDate set to now', function(done) {
            const metadata = buildMetadata([{ name: 'a' }]);
            const middleware = create.setStatusIfApplicable(metadata);
            const reqOptions = {
                body: {}
            };
            mockRequest(middleware, reqOptions, null, next);

            function next(error) {
                expect(error).to.not.be.ok();
                expect(
                    moment(reqOptions.body.statusLog[0].statusDate).diff(new Date())
                ).to.be.lessThan(1);
                done();
            }
        });

        describe('Status log data', function() {
            it('Should not exist if initialData was missing', function(done) {
                const statusToSet = {
                    name: 'a'
                };
                const metadata = buildMetadata([statusToSet]);
                const middleware = create.setStatusIfApplicable(metadata);
                const reqOptions = {
                    body: {}
                };
                mockRequest(middleware, reqOptions, null, next);

                function next(error) {
                    expect(error).to.not.be.ok();
                    const data = reqOptions.body.statusLog[0].data;
                    expect(data).to.not.be.ok();
                    done();
                }
            });

            it('Should be an empty object if initialData was an empty object', function(done) {
                const statusToSet = {
                    name: 'a',
                    initialData: {}
                };
                const metadata = buildMetadata([statusToSet]);
                const middleware = create.setStatusIfApplicable(metadata);
                const reqOptions = {
                    body: {}
                };
                mockRequest(middleware, reqOptions, null, next);

                function next(error) {
                    expect(error).to.not.be.ok();
                    const data = reqOptions.body.statusLog[0].data;
                    expect(Object.keys(data)).to.have.lengthOf(0);
                    done();
                }
            });

            it('Should be merge the result from getData', function(done) {
                const statusToSet = {
                    name: 'a',
                    initialData: {}
                };
                const metadata = buildMetadata([statusToSet]);
                const middleware = create.setStatusIfApplicable(metadata);
                const reqOptions = {
                    body: {}
                };
                const stubbedData = {
                    bob: true,
                    asd: {
                        value: 1,
                        name: 'bob'
                    }
                };
                const stub = sinon.stub(dataFunctions, 'default');
                stub.returns(stubbedData);
                mockRequest(middleware, reqOptions, null, next);

                function next(error) {
                    stub.restore();
                    expect(error).to.not.be.ok();
                    const data = reqOptions.body.statusLog[0].data;
                    expect(data).to.deep.equal(stubbedData);
                    done();
                }
            });
        });
    });
});

function buildMetadata(statuses) {
    const metadata = {
        schemas: {
            core: {}
        }
    };
    if (statuses) {
        metadata.schemas.core.statuses = statuses;
    }
    return metadata;
}
