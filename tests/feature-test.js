jest.dontMock('feature');

describe('feature', function() {

    var _feature = require('feature');
    var _core = require('core');
    var _middleware = _feature({});
    var _req;
    var _res;
    var _next;

    beforeEach(function() {
        _middleware = _feature({});
        _req = {
            'session': {
                'id': 'session id'
            }
        };
        _res = {};
        _next = jest.genMockFn();

        _core.setFeatures.mockClear();
    });

    it('should export constructor', function() {
        expect(typeof _feature).toEqual('function');
    });

    it('should return middleware', function() {
        var middleware = _feature({});

        expect(typeof middleware).toEqual('function');
    });

    it('should set feature configuration', function() {
        _feature({'feature': 100});
        expect(_core.setFeatures.mock.calls[0][0]).toEqual({'feature': 100});
    });

    it('should throw error in middleware if sessions is not set', function() {
        _req = {};
        expect(function() {
            _middleware(_req, _res, _next);
        }).toThrow();
    });

    it('should set getVariant function in middleware', function() {
        _middleware(_req, _res, _next);
        expect(typeof _req.feature.getVariant).toEqual('function');
    });

    it('should call the next middleware', function() {
        _middleware(_req, _res, _next);
        expect(_next.mock.calls.length).toEqual(1);
    });

    it('should call core.getVariant from the middleware', function() {
        _middleware(_req, _res, _next);
        _req.feature.getVariant('name');
        expect(_core.getVariant.mock.calls[0][0]).toEqual('session id');
        expect(_core.getVariant.mock.calls[0][1]).toEqual('name');
    });
});
