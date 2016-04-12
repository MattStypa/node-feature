jest.dontMock('../src/feature');

describe('feature', function() {

    var feature = require('../src/feature');
    var roller = require('../src/roller');

    var _featureConfig = {
        featureA: 0,
        featureB: 100,
        featureC: {
            variantA: 0,
            variantB: 20,
            variantC: 20,
            variantD: 60
        },
        featureD: {
            variantA: 10,
            variantB: 10
        },
        featureE: {},
        featureF: {
            variantA: -100
        },
        featureG: {
            variantA: 'test'
        },
        'featureH': [
            'variantA',
            'variantB',
            'variantC',
        ],
        featureI: true,
        featureJ: false,
    };

    var _overrides = {
        featureA: 'variantA',
        featureC: 'variantE',
        featureH: 'variantA',
    };

    beforeEach(function() {
        roller.roll.mockClear();
    });

    it('should export instantiated feature object', function() {
        var features = feature({});

        expect(typeof features).toEqual('object');
        expect(typeof features.getDigest).toEqual('function');
    });

    it('should throw error on invalid configuration', function() {
        expect(function() {
            feature('invalid');
        }).toThrow();
    });

    it('should get variant digest ', function() {
        roller.roll.mockReturnValue(30);
        var features = feature(_featureConfig);

        expect(features.getDigest('context')).toEqual({
            'featureA': null,
            'featureB': 'on',
            'featureC': 'variantC',
            'featureD': null,
            'featureE': null,
            'featureF': null,
            'featureG': null,
            'featureH': 'variantA',
            'featureI': 'on',
            'featureJ': null
        });
    });

    it('should pass context to roller', function() {
        var features = feature(_featureConfig);
        features.getDigest('context');

        expect(roller.roll.mock.calls[0][0]).toEqual('contextfeatureC');
    });

    it('should apply overrides from json', function() {
        var features = feature(_featureConfig);
        var digest = features.getDigest('context', _overrides);

        expect(digest.featureA).toEqual('variantA');
        expect(digest.featureC).toEqual('variantE');
        expect(digest.featureH).toEqual('variantA');
    });

    it('should apply overrides from json string', function() {
        var features = feature(_featureConfig);
        var digest = features.getDigest('context', JSON.stringify(_overrides));

        expect(digest.featureA).toEqual('variantA');
        expect(digest.featureC).toEqual('variantE');
        expect(digest.featureH).toEqual('variantA');
    });

    it('should apply overrides from string', function() {
        var features = feature(_featureConfig);
        var digest = features.getDigest('context', 'featureA,featureB:variantA,featureC:variantE,featureH:variantA');

        expect(digest.featureA).toEqual('on');
        expect(digest.featureB).toEqual('variantA');
        expect(digest.featureC).toEqual('variantE');
        expect(digest.featureH).toEqual('variantA');
    });
});
