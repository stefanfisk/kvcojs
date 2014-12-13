var _ = require('lodash');
var setValueForKey = require('./key-value-coding').setValueForKey;

var KeyValueDerivationMixin = {
  initDerivedKeys: function() {
    console.assert(!this._derivedKeyDisposables,
      'Derived keys are alreay initialized');

    this._derivedKeyDisposables = [];

    _.forOwn(this.derivedKeys, function(observableFn, key) {
      this.bindKeyToObservable(key, observableFn.call(this));
    }, this);
  },
  bindKeyToObservable: function(key, observable) {
    this._derivedKeyDisposables = this._derivedKeyDisposables || [];

    var disposable = observable.subscribeOnNext(function(value) {
      setValueForKey(this, key, value);
    }, this);

    this._derivedKeyDisposables.push(disposable);
  },
  disposeDerivedKeyObservables: function() {
    _.forEach(this._derivedKeyDisposables, function(disposable) {
      disposable.dispose();
    });

    this._derivedKeyDisposables = null;
  }
};

module.exports = {
  mixin: KeyValueDerivationMixin
};
