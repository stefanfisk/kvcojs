var _ = require('lodash');
var Rx = require('rx');

var keyValueCoding = require('../lib/key-value-coding');
var getValueForKey = keyValueCoding.getValueForKey;

var KeyValueDeriving = require('../lib/key-value-derivation').KeyValueDeriving;

describe('KeyValueDerivationMixin', function() {
  var Obj = function() {
    this.fooSubject = new Rx.BehaviorSubject('initialValue');

    KeyValueDeriving.call(this);
  };
  Obj.prototype.derivedKeys = {
    foo: function() {
      return this.fooSubject;
    }
  };
  _.assign(Obj.prototype, KeyValueDeriving.prototype);

  var obj;

  beforeEach(function() {
    obj = new Obj();
  });

  it('should derive keys', function() {
    obj.fooSubject.onNext('bar');
    expect(getValueForKey(obj, 'foo')).to.equal('bar');
  });

  it('dispose subscriptions', function() {
    obj.disposeDerivedKeyObservables();
    obj.fooSubject.onNext('bar');
    expect(getValueForKey(obj, 'foo')).to.equal('initialValue');
    expect(obj._derivedKeyDisposables).to.be.null();
  });
});
