var _ = require('lodash');
var splitKeyPath = require('./key-path').splitKeyPath;

/**
 * Capitalize the first character of a string.
 * @param  {string} str The input string.
 * @return {string}     The capitalized string.
 */
function capitalize(str) {
  str = str === null ? '' : String(str);
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Get the value of the named property of an object.
 *
 * Attempts the following accessor patterns, in order:
 * * obj.getKey()
 * * obj.isKey()
 * * obj.get(key)
 * * obj[key]
 *
 * @param  {object} obj The object to get the value from.
 * @param  {string} key The key to get the value for.
 * @return {mixed}  The value.
 */
function getValueForKey(obj, key) {
  var Key = capitalize(key);

  if ('' === key) {
    return obj;
  } else if (_.isFunction(obj['get' + Key])) {
    return obj['get' + Key].call(obj);
  } else if (_.isFunction(obj['is' + Key])) {
    return obj['is' + Key].call(obj);
  } else if (_.isFunction(obj.get)) {
    return obj.get(key);
  } else {
    return obj[key];
  }
}

/**
 * Set the value if the named property of an object.
 *
 * Attempts the following accessors patterns, in order:
 * * obj.setKey(value)
 * * obj.set(key, value)
 * * obj[key] = value
 *
 * @param  {object} obj   The object to set the value on.
 * @param  {string} key   The key to set the value for.
 * @param  {mixed} value  The value to set.
 */
function setValueForKey(obj, key, value) {
  console.assert(_.isString(key) && 0 < key.length,
    'key must be a non-empty string');

  var Key = capitalize(key);

  if (_.isFunction(obj['set' + Key])) {
    obj['set' + Key].call(obj, value);
  } else if (_.isFunction(obj.set)) {
    obj.set(key, value);
  } else {
    obj[key] = value;
  }
}

/**
 * Get the value of the key path relative to an object.
 *
 * Uses `getValueForKey()` to retreive values.
 *
 * @param  {object} obj     The object to get the value relative to.
 * @param  {mixed}  keyPath The key path to get the value for.
 * @return {mixed}          The value, or `null` if any of the keys in the
     path are not available.
 */
function getValueForKeyPath(obj, keyPath) {
  var keys = splitKeyPath(keyPath);
  var currentKey = _.first(keys);
  var remainingKeys = _.rest(keys);
  var value;

  value = getValueForKey(obj, currentKey);

  if (undefined === value || null === value) {
    return null;
  } else if (!_.isEmpty(remainingKeys)) {
    return getValueForKeyPath(value, remainingKeys);
  } else {
    return value;
  }
}

/**
 * Set the value of the key path relative to an object.
 *
 * Uses `getValueForKeyPath()` to get the parent as necessary, and
 *   `setValueForKey()` to set the value.
 *
 * @param  {object} obj     [description]
 * @param  {string} keyPath [description]
 * @param  {mixed}  value   [description]
 */
function setValueForKeyPath(obj, keyPath, value) {
  var keys = splitKeyPath(keyPath);
  var currentKey = _.first(keys);
  var remainingKeys = _.rest(keys);

  if (!_.isEmpty(remainingKeys)) {
    setValueForKeyPath(getValueForKey(obj, currentKey), remainingKeys, value);
  } else {
    setValueForKey(obj, currentKey, value);
  }
}

/**
 * A mixin which provides bound versions of `getValueForKeyPath()` and
 *   `setValueForKeyPath()`.
 */
var KeyValueCodingMixin = {
  getValueForKeyPath: function(keyPath) {
    return getValueForKeyPath(this, keyPath);
  },
  setValueForKeyPath: function(keyPath, value) {
    setValueForKeyPath(this, keyPath, value);

    return this;
  }
};

module.exports = {
  getValueForKey: getValueForKey,
  setValueForKey: setValueForKey,

  getValueForKeyPath: getValueForKeyPath,
  setValueForKeyPath: setValueForKeyPath,

  mixin: KeyValueCodingMixin
};
