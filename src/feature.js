module.exports = feature;

var _core = require('./core');

/**
 * Returns configured core object
 *
 * @param {object} config
 * @returns {object}
 */
function feature(config) {

    _core.setFeatures(config);

    return _core;
}
