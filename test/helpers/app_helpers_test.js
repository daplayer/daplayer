require('../test_helper');
require('../../app/helpers');

describe('Application helpers', () => {
  describe('#g', () => {
    it('should generate a Glyphicon span', () => {
      var output = Handlebars.helpers.g('foo');

      assert(output instanceof Handlebars.SafeString);
      assert.equal(output.string, '<span class="glyphicon glyphicon-foo"> </span>');
    });
  });

  describe('#t', () => {
    it('should delegate to the translation module', () => {
      I18n.load('en');

      var output = Handlebars.helpers.t('meta.history');

      assert.equal(output, 'History');
    });
  });
});
