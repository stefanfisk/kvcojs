var _ = require('lodash');
var Rx = require('rx');

var keyValueCoding = require('../lib/key-value-coding');
var setValueForKey = keyValueCoding.setValueForKey;

var keyValueObserving = require('../lib/key-value-observing');
var KeyValueObservingMixin = keyValueObserving.mixin;

describe('mixin', function() {
  var Obj = function() {};
  _.assign(Obj.prototype, KeyValueObservingMixin);

  var obj;

  beforeEach(function() {
    obj = new Obj();
    obj.foo = new Obj();
    obj.foo.bar = 'baz';
  });

  describe('observableForKey()', function() {
    describe('observer registration', function() {
      it('should not register the observer before subscribe', function() {
        var mock = sinon.mock(obj);

        mock
          .expects('observableForKey')
          .once()
          .withArgs('foo')
          .returns(Rx.Observable.return(obj.foo));

        var observable = obj.observableForKey('foo');

        expect(observable).to.be.an.instanceof(Rx.Observable);
        expect(obj._keyObservers).to.be.undefined();

        mock.verify();
      });

      it('should register the first observer on subscribe', function() {
        obj.observableForKey('foo').subscribe(function() {});

        expect(obj._keyObservers).to.be.an('object');
        expect(obj._keyObservers.foo).to.be.an('array');
        expect(obj._keyObservers.foo.length).to.equal(1);
      });

      it('should register the additional observers on subscribe for the same key', function() {
        obj.observableForKey('foo').subscribe(function() {});
        obj.observableForKey('foo').subscribe(function() {});

        expect(obj._keyObservers.foo.length).to.equal(2);
      });

      it('should register the additional observers on subscribe for the different keys', function() {
        obj.observableForKey('foo').subscribe(function() {});
        obj.observableForKey('bar').subscribe(function() {});

        expect(obj._keyObservers).to.be.an('object');
        expect(obj._keyObservers.foo).to.be.an('array');
        expect(obj._keyObservers.foo.length).to.equal(1);
        expect(obj._keyObservers.bar).to.be.an('array');
        expect(obj._keyObservers.bar.length).to.equal(1);
      });

      it('should only deregister the specific observer on unsubscribe for the same key', function() {
        obj.observableForKey('foo').subscribe(function() {});
        obj.observableForKey('foo').subscribe(function() {}).dispose();

        expect(obj._keyObservers.foo.length).to.equal(1);
      });

      it('should only deregister the specific observer on unsubscribe for different key', function() {
        obj.observableForKey('foo').subscribe(function() {});
        obj.observableForKey('bar').subscribe(function() {}).dispose();

        expect(obj._keyObservers).to.be.an('object');
        expect(obj._keyObservers.foo).to.be.an('array');
        expect(obj._keyObservers.foo.length).to.equal(1);
        expect(obj._keyObservers.bar).to.be.null();
      });

      it('should deregister the observer on last unsubscribe', function() {
        obj.observableForKey('foo').subscribe(function() {}).dispose();

        expect(obj._keyObservers).to.be.null();
      });
    });
  });

  describe('observableForKeyPath()', function() {
    describe('should send', function() {
      var values;
      function collectValues(value) {
        values.push(value);
      }

      beforeEach(function() {
        values = [];
      });

      it('initial value for single key', function() {
        obj.observableForKeyPath('foo').subscribe(collectValues);

        expect(values).to.deep.equal([obj.foo]);
      });

      it('initial value for subkey', function() {
        obj.observableForKeyPath('foo.bar').subscribe(collectValues);

        expect(values).to.deep.equal(['baz']);
      });

      it('initial value for non-observable subkey', function() {
        obj.foo.bar = {
          baz: {
            qux: 'norf'
          }
        };

        obj.observableForKeyPath('foo.bar.baz.qux').subscribe(collectValues);

        expect(values).to.deep.equal(['norf']);
      });

      it('null when removing parent subkey', function() {
        obj.observableForKeyPath('foo.bar').subscribe(collectValues);

        values = [];

        setValueForKey(obj, 'foo', null);
        obj.didChangeValueForKey('foo', null);

        expect(values).to.deep.equal([null]);
      });

      it('new value when setting object tree', function() {
        obj.observableForKeyPath('foo.bar').subscribe(collectValues);

        var foo = obj.foo;
        obj.foo = null;
        obj.didChangeValueForKey('foo', null);

        values = [];

        obj.foo = foo;
        obj.didChangeValueForKey('foo', foo);

        expect(values).to.deep.equal(['baz']);
      });
    });

    it('should deregister all key observers on key path observer unsubscribe', function() {
      obj.observableForKeyPath('foo.bar').subscribe(function() {}).dispose();

      expect(obj._keyObservers).to.be.null();
      expect(obj.foo._keyObservers).to.be.null();
    });
  });
});
