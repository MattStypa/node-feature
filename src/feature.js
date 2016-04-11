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
    if (!_.isObject(features)) {
        throw Error('Invalid configuration');
    }

    return {
        features: _getParsedFeatureConfig(features),
        getDigest: function(context, overrides) {
            return _getDigest(this.features, context, overrides);
        }
    };
}

/**
 * Gets a features digest. Digest is an object containing feature names as keys and a single winning variant as the
 * value for each feature.
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
    var variants = _.keys(feature);
    var odds = _.values(feature);

    if (!variants.length) {
        return null;
    }

    // First variant is a sure winner
    if (_.first(odds) >= 100) {
        return _.first(variants);
    }

    // No chance of winning
    if (_.last(odds) === 0) {
        return null;
    }

    var roll = roller.roll(context);

    var variant = _.findIndex(odds, function(odds) {
        return roll < odds;
    });

    if (variant < 0) {
        return null;
    }

    return variants[variant];
}

/**
 * Gets parsed features configuration
 *
 * @param {object} features
 * @returns {object}
 * @private
 */
function _getParsedFeatureConfig(features) {
    var parsedFeatureConfig = {};

    _.forEach(features, function(config, name) {
        parsedFeatureConfig[name] = _getParsedSingleFeatureConfig(config);
    });

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
    if (!_.isObject(feature)) {
        return {'on': _getSanitizedOdds(feature)};
    }

    var parsedFeatureConfig = {};
    var totalOdds = 0;

    // Auto distribute
    if (_.isArray(feature)) {
        var autoOdds = 100 / feature.length;

        _.forEach(feature, function(variant) {
            totalOdds += autoOdds;
            parsedFeatureConfig[variant] = totalOdds;
        });

        // Ensure complete coverage
        parsedFeatureConfig[_.last(feature)] = 100;

        return parsedFeatureConfig;
    }

    // Full
    _.forEach(feature, function(odds, name) {
        totalOdds += _getSanitizedOdds(odds);
        parsedFeatureConfig[name] = totalOdds;
    });

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

    if (!_.isObject(parsedOverrides)) {
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
    if (_.isBoolean(odds)) {
        odds = odds ? 100 : 0;
    } else if (!_.isNumber(odds)) {
        return 0;
    }
    return odds < 0 ? 0 : odds;
}
