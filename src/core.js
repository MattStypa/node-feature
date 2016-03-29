module.exports.setFeatures = setFeatures;
module.exports.getVariant = getVariant;

/**
 * Instance of a roller
 *
 * @type {object}
 * @private
 */
var _roller = require('roller');

/**
 * Feature configuration json
 *
 * @type {object}
 * @private
 */
var _features = {};

/**
 * Cache in which winning variants are stored
 *
 * @type {object}
 * @private
 */
var _cache = {};

/**
 * Sets and parses configured features
 *
 * @param {object} features
 */
function setFeatures(features) {
    if (typeof features !== 'object') {
        throw Error('Invalid configuration');
    }

    _features = features;

    for (var feature in _features) {
        _features[feature] = _getParsedFeatureConfig(_features[feature]);
    }
}

/**
 * Gets a winning variant for the specified feature or cached result if it has been requested before
 *
 * @param {string} context
 * @param {string} name
 * @returns {string}
 */
function getVariant(context, name) {
    var featureId = _getFeatureId(context, name);

    // Check if feature is cached
    if (!_cache.hasOwnProperty(featureId)) {
        _cache[featureId] = _getFreshVariant(context, name);
    }

    return _cache[featureId];
}

/**
 * Gets a winning variant for a specified feature without checking cache
 *
 * @param {string} context
 * @param {string} name
 * @returns {string|null}
 * @private
 */
function _getFreshVariant(context, name) {
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

    for (var variant in featureConfig) {
        totalOdds += _getSanitizedOdds(featureConfig[variant]);
        parsedFeatureConfig[variant] = totalOdds;
    }

    return parsedFeatureConfig;
}

/**
 * Gets a normalized odds
 *
 * @param {number} odds
 * @returns {number}
 * @private
 */
function _getSanitizedOdds(odds) {
    if (isNaN(odds)) {
        return 0;
    }
    return odds < 0 ? 0 : odds;
}
