module.exports = feature;

var _core = require('core');

function feature(config) {

    _core.setFeatures(config);

    return function(req, res, next) {
        if (!req.hasOwnProperty('session')) {
            throw Error('Session not set');
        }

        req.feature = {
            getVariant: function(name) {
                return _core.getVariant(req.session.id, name);
            }
        };
        next();
    };
}
