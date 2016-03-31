module.exports = feature;

var _core = require('./core');

function feature(config) {

    _core.setFeatures(config);

    return _core;
}
