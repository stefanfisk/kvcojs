var _ = require('lodash');
var keyValueCoding = require('../lib/key-value-coding');
var getValueForKey = keyValueCoding.getValueForKey;
var getValueForKeyPath = keyValueCoding.getValueForKeyPath;
var Rx = require('rx');
var splitKeyPath = require('./key-path').splitKeyPath;

function KeyValueObservable() {
}

/**
 * Notify all observers that the value changed for `key`.
 *
 * @param  {string} key  The changed key.
 * @param  {mixed} value Optionally, the new value. If not passed,
 *   `getValueForKey(this, key)` is used.
 */
KeyValueObservable.prototype.didChangeValueForKey = function(key, value) {
  if (!this._keyObservers) {
    return;
  }

  var observers = this._keyObservers[key];

  if (!observers) {
    return;
  }

  if (1 === arguments.length) {
    value = getValueForKey(this, key);
  }

  observers.forEach(function(observer) {
    observer.onNext(value);
  });
};

/**
 * Create a new observable for the value of the specified key.
 *
 * Sends the current value on subscription.
 *
 * The receiver only keeps references to subscribed observables.
 *
 * @param  {string} key    The key to observe.
 * @return {Rx.Observable} The observable.
 */
KeyValueObservable.prototype.observableForKey = function(key) {
  return Rx.Observable.create(function(observer) {
    var keyObservers = this._keyObservers = this._keyObservers || {};
    var observers = keyObservers[key] =
      this._keyObservers[key] || [];

    observers.push(observer);

    var initialValue = getValueForKey(this, key);

    observer.onNext(initialValue);

    return function() {
      observers.splice(observers.indexOf(observer), 1);

      if (_.isEmpty(observers)) {
        keyObservers[key] = null;
      }

      if (_.isEmpty(_.filter(keyObservers))) {
        this._keyObservers = null;
      }
    }.bind(this);
  }.bind(this));
};

/**
 * Create a new observable for the value of the specified key path.
 *
 * Sends the current value on subscription.
 *
 * Calls `observableForKeyPath(keyPath)` recursively as necessary to observe
 *   all subkeys. If a subvalue is not observable, it is returned using
 *   `getValueForKeyPath(obj, keyPath)`.
 *
 * @param  {string} keyPath The key path to observe.
 * @return {Rx.Observable}  The observable.
 */
KeyValueObservable.prototype.observableForKeyPath = function(keyPath) {
  var keys = splitKeyPath(keyPath);
  var currentKey = _.first(keys);
  var remainingKeys = _.rest(keys);

  if (!_.isEmpty(remainingKeys)) {
    return this.observableForKey(currentKey)
      .map(function(value) {
        if (undefined === value || null === value) {
          return Rx.Observable.return(null);
        } else if (!_.isFunction(value.observableForKeyPath)) {
          return Rx.Observable.return(getValueForKeyPath(value,
            remainingKeys));
        } else {
          return value.observableForKeyPath(remainingKeys);
        }
      })
      .switch();
  }

  return this.observableForKey(currentKey);
};

module.exports = {
  KeyValueObservable: KeyValueObservable
};
