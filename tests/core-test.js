jest.dontMock('../src/core');

describe('feature library', function() {

    var _core = require('../src/core');
    var _roller = require('../src/roller');

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
            'variant_c',
        ]
    };

    var _overrides = {
        featureA: 'variantA',
        featureC: 'variantE',
        featureH: 'variantA',
    };

    beforeEach(function() {
        _core.setFeatures(_featureConfig);
    });

    it('throws an error when configuration is invalid', function() {
        expect(function() {
            _core.setFeatures('Not and Object');
        }).toThrow();
    });

    it('gets null for feature with no variants', function() {
        expect(_core.getVariant('context', 'featureE')).toEqual(null);
    });

    it('gets on variant for enabled features', function() {
        expect(_core.getVariant('context', 'featureB')).toEqual('on');
    });

    it('gets variant for multi-variant features', function() {
        _roller.roll.mockReturnValue(30);
        expect(_core.getVariant('context', 'featureC')).toEqual('variantC');
    });

    it('gets null variant for disabled features', function() {
        expect(_core.getVariant('context', 'featureA')).toEqual(null);
    });

    it('auto distributes odds for array of variants', function() {
        _roller.roll.mockReturnValue(20);
        expect(_core.getVariant('context', 'featureH')).toEqual('variantA');

        _roller.roll.mockReturnValue(50);
        expect(_core.getVariant('context', 'featureH')).toEqual('variantB');

        _roller.roll.mockReturnValue(80);
        expect(_core.getVariant('context', 'featureH')).toEqual('variantC');
    });

    it('gets variant digest', function() {
        _roller.roll.mockReturnValue(30);
        expect(_core.getVariantDigest('context')).toEqual({
            'featureA': null,
            'featureB': 'on',
            'featureC': 'variantC',
            'featureD': null,
            'featureE': null,
            'featureF': null,
            'featureG': null,
            'featureH': 'variantA'
        });
    });

    it('normalizes negative odds to 0', function() {
        _roller.roll.mockReturnValue(0);
        expect(_core.getVariant('context', 'featureF')).toEqual(null);
    });

    it('normalizes NaN odds to 0', function() {
        _roller.roll.mockReturnValue(0);
        expect(_core.getVariant('context', 'featureG')).toEqual(null);
    });

    it('gets null for undefined feature', function() {
        expect(_core.getVariant('context', 'featureX')).toEqual(null);
    });

    it('gets null if no variant wins', function() {
        _roller.roll.mockReturnValue(30);
        expect(_core.getVariant('context', 'featureD')).toEqual(null);
    });

    it('should apply overrides from json', function() {
        _core.applyOverrides(_overrides);

        expect(_core.getVariant('context', 'featureA')).toEqual('variantA');
        expect(_core.getVariant('context', 'featureC')).toEqual('variantE');
        expect(_core.getVariant('context', 'featureH')).toEqual('variantA');
    });

    it('should apply overrides from json string', function() {
        _core.applyOverrides(JSON.stringify(_overrides));

        expect(_core.getVariant('context', 'featureA')).toEqual('variantA');
        expect(_core.getVariant('context', 'featureC')).toEqual('variantE');
        expect(_core.getVariant('context', 'featureH')).toEqual('variantA');
    });

    it('should apply overrides from string', function() {
        _core.applyOverrides('featureA,featureB:variantA,featureC:variantE,featureH:variantA');

        expect(_core.getVariant('context', 'featureA')).toEqual('on');
        expect(_core.getVariant('context', 'featureB')).toEqual('variantA');
        expect(_core.getVariant('context', 'featureC')).toEqual('variantE');
        expect(_core.getVariant('context', 'featureH')).toEqual('variantA');
    });
});
