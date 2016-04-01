jest.dontMock('../src/core');

describe('feature library', function() {

    var _core = require('../src/core');
    var _roller = require('../src/roller');

    var _featureConfig = {
        'feature_a': 0,
        'feature_b': 100,
        'feature_c': {
            'variant_a': 0,
            'variant_b': 20,
            'variant_c': 20,
            'variant_d': 60
        },
        'feature_d': {
            'variant_a': 10,
            'variant_b': 10
        },
        'feature_e': {},
        'feature_f': {
            'variant_a': -100
        },
        'feature_g': {
            'variant_a': 'test'
        }
    };

    _core.setFeatures(_featureConfig);

    it('throws an error when configuration is invalid', function() {
        expect(function() {
            _core.setFeatures('Not and Object');
        }).toThrow();
    });

    it('gets null for feature with no variants', function() {
        expect(_core.getVariant('context', 'feature_e')).toEqual(null);
    });

    it('gets on variant for enabled features', function() {
        expect(_core.getVariant('context', 'feature_b')).toEqual('on');
    });

    it('gets variant for multi-variant features', function() {
        _roller.roll.mockReturnValue(30);
        expect(_core.getVariant('context', 'feature_c')).toEqual('variant_c');
    });

    it('gets null variant for disabled features', function() {
        expect(_core.getVariant('context', 'feature_a')).toEqual(null);
    });

    it('gets variant digest', function() {
        _roller.roll.mockReturnValue(30);
        expect(_core.getVariantDigest('context')).toEqual({

            'feature_a': null,
            'feature_b': 'on',
            'feature_c': 'variant_c',
            'feature_d': null,
            'feature_e': null,
            'feature_f': null,
            'feature_g': null,
        });
    });

    it('normalizes negative odds to 0', function() {
        _roller.roll.mockReturnValue(0);
        expect(_core.getVariant('context', 'feature_f')).toEqual(null);
    });

    it('normalizes NaN odds to 0', function() {
        _roller.roll.mockReturnValue(0);
        expect(_core.getVariant('context', 'feature_g')).toEqual(null);
    });

    it('gets null for undefined feature', function() {
        expect(_core.getVariant('context', 'feature_x')).toEqual(null);
    });

    it('gets null if no variant wins', function() {
        _roller.roll.mockReturnValue(30);
        expect(_core.getVariant('context', 'feature_d')).toEqual(null);
    });
});
