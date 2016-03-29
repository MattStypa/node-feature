module.exports.roll = roll;
module.exports.rollInt = rollInt;
module.exports.getIntFromSalt = getIntFromSalt;

var crypto = require('crypto');

// Maximum 32bit integer
var maximum = 0xFFFFFFFF;

/**
 * Generates evenly distributed value [0, 100) based on salt
 *
 * @param {string} salt
 * @returns {number}
 */
function roll(salt) {
    return rollInt(getIntFromSalt(salt));
}

/**
 * Generates evenly distributed value [0, 100) based on integer
 *
 * @param {number} intSalt
 * @returns {number}
 */
function rollInt(intSalt) {
    if (isNaN(intSalt)) {
        throw new Error(intSalt + ' is not a number');
    }

    // Take 1 away from roll to achieve open set
    intSalt--;

    // Percent of roll out of maximum
    return intSalt / maximum * 100;
}

/**
 * Converts anything into a integer representation
 *
 * @param {string} salt
 * @returns {Number}
 */
function getIntFromSalt(salt) {
    // Get sha256 hash of the salt
    var hash = crypto.createHash('sha256');
    var digest = hash.update(salt.toString()).digest();

    // Get a 32bit INT from the hash
    return digest.readUInt32BE(0);
}
