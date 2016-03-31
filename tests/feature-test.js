jest.dontMock('feature');

describe('feature', function() {

    var _feature = require('feature');
    var _core = require('core');

    it('should export constructor', function() {
        expect(typeof _feature).toEqual('function');
    });

    it('should set feature configuration', function() {
        var configuration = {'feature': 100};

        _feature(configuration);
        expect(_core.setFeatures.mock.calls[0][0]).toEqual(configuration);
    });

    it('should return core', function() {
        expect(_feature({})).toEqual(_core);
    });
});
