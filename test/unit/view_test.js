'use strict';

require('../test_helper');

const View = require('../../app/view');

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

  describe('#partial', () => {
    beforeEach(() => {
      Cache.templates.foo = (context) => { return context };
    });

    it('should return a Handlebars.SafeString instance', () => {
      assert(View.partial('foo') instanceof Handlebars.SafeString);
    });

    it('should compile the template', () => {
      assert.equal(View.partial('foo', 'bar').string, 'bar');
    })
  });
});
