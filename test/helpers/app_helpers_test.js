require('../test_helper');
require('../../app/helpers');

describe('Application helpers', () => {
  before(() => {
    I18n.load('en')
  })

  describe('#g', () => {
    it('should generate a Glyphicon span', () => {
      var output = Handlebars.helpers.g('foo');

      assert(output instanceof Handlebars.SafeString);
      assert.equal(output.string, '<span class="glyphicon glyphicon-foo"> </span>');
    });
  });

  describe('#t', () => {
    it('should delegate to the translation module', () => {
      var output = Handlebars.helpers.t('meta.history');

      assert.equal(output, 'History');
    });
  });

  describe('#interpolate', () => {
    it('should delegate to the i18n module passing the current scope', () => {
      var context = { current: 10, total: 100 };
      var output  = Handlebars.helpers.interpolate('local.feedback.progress', {
        data: { root: context }
      });

      assert.equal(output.string, '10 files processed out of 100.');
    });
  });

  describe('pluralize', () => {
    it('should delegate to the i18n module', () => {
      var output = Handlebars.helpers.pluralize(10, 'album')

      assert.equal(output, '10 albums')
    })
  })

  describe('titleize', () => {
    it('should delegate to the i18n module', () => {
      var output = Handlebars.helpers.titleize('album')

      assert.equal(output, 'Album')
    })
  })
});
