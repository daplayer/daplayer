'use strict';

require('../test_helper');

const View = require('../../app/view');

describe('View', () => {
  before(() => {
    global.Handlebars = {
      compile: function() { return true; }
    }
  });

  after(() => {
    global.Handlebars = require('handlebars');
  });

  describe('#compile', () => {
    it('should compile the given path through Handlebars', () => {
      assert.equal(true, View.compile('meta/index'));
    });

    it('should look-up for an entry in the cache', () => {
      Cache.templates.foo = 'bar';

      assert.equal('bar', View.compile('foo'));
    });
  });
});
