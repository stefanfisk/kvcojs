var _ = require('lodash');
var setValueForKey = require('./key-value-coding').setValueForKey;

function deriveKeyFromObservable(obj, key, observable) {
  return observable.subscribeOnNext(function(value) {
    setValueForKey(obj, key, value);
  });
}

function KeyValueDeriving() {
  this._derivedKeyDisposables = null;

  _.forOwn(this.derivedKeys, function(observableFn, key) {
    this.deriveKeyFromObservable(key, observableFn.call(this));
  }, this);
}
KeyValueDeriving.prototype.deriveKeyFromObservable = function(key,
  observable) {
  this._derivedKeyDisposables = this._derivedKeyDisposables || [];

  this._derivedKeyDisposables.push(deriveKeyFromObservable(this, key,
    observable));
};
KeyValueDeriving.prototype.disposeDerivedKeyObservables = function() {
  this._derivedKeyDisposables.forEach(function(disposable) {
    disposable.dispose();
  });

  this._derivedKeyDisposables = null;
};

module.exports = {
  deriveKeyFromObservable: deriveKeyFromObservable,
  KeyValueDeriving: KeyValueDeriving
};
