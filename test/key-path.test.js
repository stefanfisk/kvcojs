var splitKeyPath = require('../key-path').splitKeyPath;

describe('splitKeyPath()', function() {
  it('should split dot notaded strings', function() {
    expect(splitKeyPath('foo.bar.foo.bar')).to.deep.equal(['foo', 'bar', 'foo', 'bar']);
  });

  it('should pass through arrays', function() {
    expect(splitKeyPath(['foo', 'bar', 'foo', 'bar'])).to.deep.equal(['foo', 'bar', 'foo', 'bar']);
  });
});
