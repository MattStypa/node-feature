module.exports = feature;

var _ = require('lodash');
var roller = require('../src/roller');

/**
 * Get a configured features object that exposes getDigest function
 *
 * @param {object} features
 * @returns {object}
 */
function feature(features) {
    return {
        features: _getParsedFeatureConfig(features),
        getDigest: function(context, overrides) {
            return _getDigest(this.features, context, overrides);
        }
    };
}

/**
 * Gets features digest
 *
 * @param {object} features
 * @param {string} context
 * @param {object|string} overrides
 * @returns {Object}
 * @private
 */
function _getDigest(features, context, overrides) {
    overrides = overrides || {};

    return _.mapValues(_.assign(features, _getParsedOverrides(overrides)), function(value, key) {
        return _getVariant(value, context + key);
    });
}

/**
 * Gets variant of a feature in a context
 *
 * @param {object} feature
 * @param {string} context
 * @returns {string|null}
 * @private
 */
function _getVariant(feature, context) {
    var variants = Object.keys(feature);

    if (!variants.length) {
        return null;
    }

    // First variant is a sure winner
    if (feature[variants[0]] >= 100) {
        return variants[0];
    }

    // No chance of winning
    if (feature[variants[variants.length - 1]] === 0) {
        return null;
    }

    var roll = roller.roll(context);

    for (var variant in feature) {
        if (roll < feature[variant]) {
            return variant.toString();
        }
    }

    return null;
}

/**
 * Gets parsed features configuration
 *
 * @param {object} features
 * @returns {object}
 * @private
 */
function _getParsedFeatureConfig(features) {
    if (typeof features !== 'object') {
        throw Error('Invalid configuration');
    }

    var parsedFeatureConfig = {};

    for (var feature in features) {
        parsedFeatureConfig[feature] = _getParsedSingleFeatureConfig(features[feature]);
    }

    return parsedFeatureConfig;
}

/**
 * Gets parsed configuration of a single feature
 *
 * @param {object} feature
 * @returns {object}
 * @private
 */
function _getParsedSingleFeatureConfig(feature) {
    // Shorthand
    if (typeof feature !== 'object') {
        return {'on': _getSanitizedOdds(feature)};
    }

    var parsedFeatureConfig = {};
    var totalOdds = 0;
    var variant;

    // Auto distribute
    if (Array.isArray(feature)) {
        var autoOdds = 100 / feature.length;

        for (variant in feature) {
            totalOdds += autoOdds;
            parsedFeatureConfig[feature[variant]] = totalOdds;
        }

        // Ensure complete coverage
        parsedFeatureConfig[feature[variant]] = 100;

        return parsedFeatureConfig;
    }

    // Full
    for (variant in feature) {
        totalOdds += _getSanitizedOdds(feature[variant]);
        parsedFeatureConfig[variant] = totalOdds;
    }

    return parsedFeatureConfig;
}

/**
 * Gets parsed feature configuration from overrides
 *
 * @param {object|string} overrides
 * @returns {Object}
 * @private
 */
function _getParsedOverrides(overrides) {
    var parsedOverrides = {};

    try {
        parsedOverrides = JSON.parse(overrides);
    } catch (e) {
        parsedOverrides = overrides;
    }

    if (typeof parsedOverrides !== 'object') {
        parsedOverrides = _getParsedStringOverrides(overrides);
    } else {
        parsedOverrides = _.mapValues(parsedOverrides, function(value) {
            var newValue = {};
            newValue[value] = 100;

            return newValue;
        });
    }

    return _getParsedFeatureConfig(parsedOverrides);
}

/**
 * Gets parsed feature configuration from string based overrides
 *
 * @param {string} overrides
 * @returns {object}
 * @private
 */
function _getParsedStringOverrides(overrides) {
    return overrides.toString().split(',').reduce(function(obj, value) {
        value = value.split(':');
        if (value.length > 1) {
            obj[value[0]] = {};
            obj[value[0]][value[1]] = 100;
        } else {
            obj[value[0]] = 100;
        }
        return obj;
    }, {});
}

/**
 * Gets a normalized odds
 *
 * @param {*} odds
 * @returns {number}
 * @private
 */
function _getSanitizedOdds(odds) {
    if (isNaN(odds)) {
        return 0;
    }
    return odds < 0 ? 0 : odds;
}
