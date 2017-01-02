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

  describe('#interpolate', () => {
    it('should delegate to the i18n module passing the current scope', () => {
      I18n.load('en');

      var context = { current: 10, total: 100 };
      var output  = Handlebars.helpers.interpolate('local.feedback.progress', {
        data: { root: context }
      });

      assert.equal(output.string, '10 files processed out of 100.');
    });
  });
});
