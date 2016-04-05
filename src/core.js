module.exports.setFeatures = setFeatures;
module.exports.applyOverrides = applyOverrides;
module.exports.getVariant = getVariant;
module.exports.getVariantDigest = getVariantDigest;

/**
 * Instance of a roller
 *
 * @type {object}
 * @private
 */
var _roller = require('./roller');

/**
 * Feature configuration json
 *
 * @type {object}
 * @private
 */
var _features = {};

/**
 * Sets and parses configured features
 *
 * @param {object} features
 */
function setFeatures(features) {
    if (typeof features !== 'object') {
        throw Error('Invalid configuration');
    }

    _features = {};

    for (var feature in features) {
        _features[feature] = _getParsedFeatureConfig(features[feature]);
    }
}

/**
 * Applies overrides to the configuration
 *
 * @param {string|object} overrides
 */
function applyOverrides(overrides) {
    var parsedOverrides = {};

    if (typeof overrides === 'object') {
        parsedOverrides = overrides;
    } else {
        // Try to parse JSON from string
        try {
            parsedOverrides = JSON.parse(overrides);
        } catch (e) {
            parsedOverrides = overrides.split(',').reduce(function(obj, value) {
                value = value.split(':');
                if (value.length > 1) {
                    obj[value[0]] = value[1];
                } else {
                    obj[value[0]] = 'on';
                }
                return obj;
            }, {});
        }
    }

    for (var feature in parsedOverrides) {
        _features[feature] = {};

        if (parsedOverrides[feature]) {
            _features[feature][parsedOverrides[feature]] = 100;
        }
    }
}

/**
 * Gets a winning variant for the specified feature or cached result if it has been requested before
 *
 * @param {string} context
 * @param {string} name
 * @returns {string|null}
 */
function getVariant(context, name) {
    // Check if this feature is defined
    if (!_features.hasOwnProperty(name)) {
        return null;
    }

    var variants = Object.keys(_features[name]);

    if (!variants.length) {
        return null;
    }

    // First variant is a sure winner
    if (_features[name][variants[0]] >= 100) {
        return variants[0];
    }

    // No chance of winning
    if (_features[name][variants[variants.length - 1]] === 0) {
        return null;
    }

    var roll = _roller.roll(_getFeatureId(context, name));

    for (var variant in _features[name]) {
        if (roll < _features[name][variant]) {
            return variant.toString();
        }
    }

    return null;
}

/**
 * Returns a collection of each feature with selected variant
 *
 * @param {string} context
 * @returns {object}
 */
function getVariantDigest(context) {
    var featureDigest = {};

    for (var feature in _features) {
        featureDigest[feature] = getVariant(context, feature);
    }

    return featureDigest;
}

/**
 * Gets feature ID built from context and name
 *
 * @param {string} context
 * @param {string} name
 * @returns {string}
 * @private
 */
function _getFeatureId(context, name) {
    return context + ':' + name;
}

/**
 * Gets parsed and normalized feature configuration
 *
 * @param {object} featureConfig
 * @returns {object}
 * @private
 */
function _getParsedFeatureConfig(featureConfig) {

    // Shorthand
    if (typeof featureConfig !== 'object') {
        return {'on': _getSanitizedOdds(featureConfig)};
    }

    var parsedFeatureConfig = {};
    var totalOdds = 0;
    var variant;

    // Auto distribute
    if (Array.isArray(featureConfig)) {
        var autoOdds = 100 / featureConfig.length;

        for (variant in featureConfig) {
            totalOdds += autoOdds;
            parsedFeatureConfig[featureConfig[variant]] = totalOdds;
        }

        // Ensure complete coverage
        parsedFeatureConfig[featureConfig[variant]] = 100;

        return parsedFeatureConfig;
    }

    // Full
    for (variant in featureConfig) {
        totalOdds += _getSanitizedOdds(featureConfig[variant]);
        parsedFeatureConfig[variant] = totalOdds;
    }

    return parsedFeatureConfig;
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
