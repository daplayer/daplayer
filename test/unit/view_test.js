'use strict';

require('../test_helper');

describe('View', () => {
  describe('#compile', () => {
    before(() => {
      global.Handlebars = {
        compile: function() { return true; }
      }
    });

    after(() => {
      global.Handlebars = require('handlebars');
    });

    it('should compile the given path through Handlebars', () => {
      assert.equal(true, View.compile('meta/index'));
    });

    it('should look-up for an entry in the cache', () => {
      Cache.templates.foo = 'bar';

      assert.equal('bar', View.compile('foo'));
    });
  });

  describe('registerPartial', () => {
    beforeEach(() => {
      Cache['templates']['foo'] = (context) => { return context }
      View.registerPartial('foo', 'bar')
    });

    it('should define the Handlebars helper', () => {
      assert.equal(typeof Handlebars.helpers.bar, 'function')
    })

    it('should return a Handlebars.SafeString instance', () => {
      assert(Handlebars.helpers.bar('baz') instanceof Handlebars.SafeString);
    })

    it('should properly compile the template', () => {
      assert.equal(Handlebars.helpers.bar('baz').string, 'baz');
    })
  });
});
