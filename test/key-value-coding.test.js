var keyValueCoding = require('../key-value-coding');
var getValueForKey = keyValueCoding.getValueForKey;
var setValueForKey = keyValueCoding.setValueForKey;
var getValueForKeyPath = keyValueCoding.getValueForKeyPath;
var setValueForKeyPath = keyValueCoding.setValueForKeyPath;

describe('getValueForKey()', function() {
  it('should get using obj.getKey()', function() {
    var obj = {
      getFoo: function() {},
      isFoo: function() {},
      get: function(key) {},
      foo: 'obj[foo]'
    };
    var mock = sinon.mock(obj);

    mock.expects('getFoo').once().returns('getFoo()');
    mock.expects('isFoo').never().returns('isFoo()');
    mock.expects('get').never().returns('get()');

    var value = getValueForKey(obj, 'foo');

    expect(value).to.equal('getFoo()');

    mock.verify();
  });

  it('should get using obj.isKey()', function() {
    var obj = {
      isFoo: function() {},
      get: function(key) {},
      foo: 'obj[foo]'
    };
    var mock = sinon.mock(obj);

    mock.expects('isFoo').once().returns('isFoo()');
    mock.expects('get').never().returns('get()');

    var value = getValueForKey(obj, 'foo');

    expect(value).to.equal('isFoo()');

    mock.verify();
  });

  it('should get using obj.get(key)', function() {
    var obj = {
      get: function(key) {},
      foo: 'obj[foo]'
    };
    var mock = sinon.mock(obj);

    mock.expects('get').once().returns('get()');

    var value = getValueForKey(obj, 'foo');

    expect(value).to.equal('get()');

    mock.verify();
  });

  it('should get using obj[key]', function() {
    var obj = {
      foo: 'obj[foo]'
    };

    var value = getValueForKey(obj, 'foo');

    expect(value).to.equal('obj[foo]');
  });

  it('should return receiver for empty key', function() {
    var obj = {};

    var value = getValueForKey(obj, '');

    expect(value).to.equal(obj);
  });
});

describe('setValueForKey()', function() {
  it('should set using obj.setKey()', function() {
    var obj = {
      setFoo: function() {},
      set: function(key) {}
    };
    var mock = sinon.mock(obj);

    mock.expects('setFoo').once().withArgs('value');
    mock.expects('set').never();

    setValueForKey(obj, 'foo', 'value');

    expect(obj.foo).to.equal(undefined);

    mock.verify();
  });

  it('should set using obj.set(key)', function() {
    var obj = {
      set: function(key) {}
    };
    var mock = sinon.mock(obj);

    mock.expects('set').once().withArgs('foo', 'value');

    setValueForKey(obj, 'foo', 'value');

    expect(obj.foo).to.equal(undefined);

    mock.verify();
  });

  it('should set using obj[key]', function() {
    var obj = {
    };

    setValueForKey(obj, 'foo', 'value');

    expect(obj.foo).to.equal('value');
  });
});

describe('getValueForKeyPath()', function() {
  it('should get single', function() {
    var obj = {
      foo: 'bar'
    };

    var value = getValueForKeyPath(obj, 'foo');

    expect(value).to.equal('bar');
  });

  it('should get nested', function() {
    var obj = {
      foo: {
        bar: 'value'
      }
    };

    var value = getValueForKeyPath(obj, 'foo.bar');

    expect(value).to.equal('value');
  });

  it('should return `null` when getting nested with missing subpath value', function() {
    var obj = {
      foo: {
      }
    };

    var value = getValueForKeyPath(obj, 'foo.bar.baz');

    expect(value).to.equal(null);
  });
});

describe('setValueForKeyPath()', function() {
  it('should set single', function() {
    var obj = {};

    var value = setValueForKeyPath(obj, 'foo', 'bar');

    expect(obj.foo).to.equal('bar');
  });

  it('should set nested', function() {
    var obj = {
      foo: {}
    };

    var value = setValueForKeyPath(obj, 'foo.bar', 'baz');

    expect(obj.foo.bar).to.equal('baz');
  });

  it('should throw when setting nested with missing subpath value', function() {
    var obj = {
      foo: {
      }
    };

    expect(function() { setValueForKeyPath(obj, 'foo.bar.baz'); }).to.throw();
  });
});
