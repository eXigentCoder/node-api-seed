require('../../@util/init.js');
import getDataFromReq from '../../../src/crud/data-mapping/get-data-from-req';
const httpMocks = require('node-mocks-http');

describe('getFromReqObject', function() {
    it('Should map shallow properties from the req using the map', function() {
        const req = httpMocks.createRequest({
            a: 'b'
        });
        const map = {
            answer: 'a'
        };
        const data = getDataFromReq(map, req, 0, undefined, ['a']);
        expect(data.answer).to.equal('b');
    });

    it('Should map deep properties from the req using the map', function() {
        const req = httpMocks.createRequest({
            a: {
                b: 'c'
            }
        });
        const map = {
            answer: 'a.b'
        };
        const data = getDataFromReq(map, req, 0, undefined, ['a']);
        expect(data.answer).to.equal('c');
    });

    it('Should support a nested map structure', function() {
        const req = httpMocks.createRequest({
            a: 'b'
        });
        const map = {
            nested: {
                answer: 'a'
            }
        };
        const data = getDataFromReq(map, req, 0, undefined, ['a']);
        expect(data.nested.answer).to.equal('b');
    });

    it('Should support a nested map structure with a nested request object', function() {
        const req = httpMocks.createRequest({
            a: {
                b: 'c'
            }
        });
        const map = {
            nested: {
                answer: 'a.b'
            }
        };
        const data = getDataFromReq(map, req, 0, undefined, ['a']);
        expect(data.nested.answer).to.equal('c');
    });

    it('Should throw an error for circular reference maps', function() {
        const req = httpMocks.createRequest({
            a: {
                b: 'c'
            }
        });
        const map = {
            nested: {}
        };
        map.nested.answer = map;
        expect(function() {
            getDataFromReq(map, req);
        }).to.throw(/circular reference/i);
    });

    const notAString = /must be a string/i;

    it('Should throw an error if the map was a number', function() {
        const req = httpMocks.createRequest({
            a: 'b'
        });
        const map = {
            answer: 1
        };
        expect(function() {
            getDataFromReq(map, req);
        }).to.throw(notAString);
    });

    it('Should throw an error if the map was a boolean', function() {
        const req = httpMocks.createRequest({
            a: 'b'
        });
        const map = {
            answer: true
        };
        expect(function() {
            getDataFromReq(map, req);
        }).to.throw(notAString);
    });

    it('Should not throw an error if the map was an empty object', function() {
        const req = httpMocks.createRequest({
            a: 'b'
        });
        const map = {
            answer: {}
        };
        const data = getDataFromReq(map, req);
        expect(data.answer).to.deep.equal({});
    });

    it('Should throw an error if the map was null', function() {
        const req = httpMocks.createRequest({
            a: 'b'
        });
        const map = {
            answer: null
        };
        expect(function() {
            getDataFromReq(map, req);
        }).to.throw(notAString);
    });

    it('Should throw an error if the map was undefined', function() {
        const req = httpMocks.createRequest({
            a: 'b'
        });
        const map = {
            answer: undefined
        };
        expect(function() {
            getDataFromReq(map, req);
        }).to.throw(notAString);
    });

    it('Should use the default value if one was supplied', function() {
        const req = httpMocks.createRequest({
            a: 'b'
        });
        const map = {
            answer: ['c', 'd']
        };
        const result = getDataFromReq(map, req, 0, undefined, ['c']);
        expect(result.answer).to.equal('d');
    });

    it('Should use the first value in the array for the map if only that is specified', function() {
        const req = httpMocks.createRequest({
            a: 'b'
        });
        const map = {
            answer: ['a']
        };
        const result = getDataFromReq(map, req, 0, undefined, ['a']);
        expect(result.answer).to.equal('b');
    });

    it('Should throw an error if the first value in the array was not a string', function() {
        const req = httpMocks.createRequest({
            a: 'b'
        });
        const map = {
            answer: [1]
        };
        expect(function() {
            getDataFromReq(map, req);
        }).to.throw(notAString);
    });

    it('Should throw an error if the array is empty', function() {
        const req = httpMocks.createRequest({
            a: 'b'
        });
        const map = {
            answer: []
        };
        expect(function() {
            getDataFromReq(map, req);
        }).to.throw(notAString);
    });

    it('Should throw an error if the array has more than 2 entries', function() {
        const req = httpMocks.createRequest({
            a: 'b'
        });
        const map = {
            answer: ['a', 'a', 'a']
        };
        expect(function() {
            getDataFromReq(map, req);
        }).to.throw(/too many items in array/i);
    });

    const invalidSuffix = /Map is not allowed to end with/i;
    it('Should not allow map values that end with something on the exception list', function() {
        const req = httpMocks.createRequest({
            a: {
                b: 'c'
            }
        });
        const map = {
            answer: 'a.b'
        };
        const disallowedSuffixList = ['.b'];
        expect(function() {
            getDataFromReq(map, req, 0, disallowedSuffixList);
        }).to.throw(invalidSuffix);
    });

    it('Should not allow map values that end with something on the default exception list', function() {
        const req = httpMocks.createRequest({
            a: {
                b: 'c'
            }
        });
        const map = {
            answer: 'a.password'
        };
        expect(function() {
            getDataFromReq(map, req);
        }).to.throw(invalidSuffix);
    });

    const invalidPrefix = /Map must start with one of /i;
    it('Should not allow access to req properties are not on the exception list', function() {
        const req = httpMocks.createRequest({
            a: {
                b: 'c'
            }
        });
        const map = {
            answer: 'a.b'
        };
        const allowedPrefixList = [];
        expect(function() {
            getDataFromReq(map, req, 0, undefined, allowedPrefixList);
        }).to.throw(invalidPrefix);
    });

    it('Should not allow map values that end with something on the default exception list', function() {
        const req = httpMocks.createRequest({
            body: {
                b: 'c'
            }
        });
        const map = {
            answer: 'body.password'
        };
        expect(function() {
            getDataFromReq(map, req);
        }).to.throw(invalidSuffix);
    });
});
