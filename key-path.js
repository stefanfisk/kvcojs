var _ = require('lodash');

/**
 * Splits a key path into its segments.
 * @param  {mixed} keyPath The key path to split. Can be either a string or an
 *   array. Arrays will be returned as-is.
 * @return {array}         An array containing the keypath's segments.
 */
function splitKeyPath(keyPath) {
  console.assert(_.isArray(keyPath) || _.isString(keyPath), 'keypath must be ' +
    'either array or string');

  if (_.isArray(keyPath)) {
    return keyPath;
  }

  return keyPath.split('.');
}

module.exports = {
  splitKeyPath: splitKeyPath
};
