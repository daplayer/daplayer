require('../test_helper');
require('../../local/helpers');

describe('Local helpers', () => {
  before(() => {
    Translation.load('en');
  });

  describe('#local_files_menu', () => {
    it('should generate a div with a "navabar" class', () => {
      var output = Handlebars.helpers.local_files_menu();

      assert(output instanceof Handlebars.SafeString);
      assert.include(output, '<div class="navbar">');
    });

    it('should create a link for each section', () => {
      var output = Handlebars.helpers.local_files_menu();

      assert.include(output, '<a href="local/singles">');
      assert.include(output, '<a href="local/albums">');
      assert.include(output, '<a href="local/artists">');

      assert.include(output, Translation.t('local.files_menus.singles'));
      assert.include(output, Translation.t('local.files_menus.albums'));
      assert.include(output, Translation.t('local.files_menus.artists'));
    });

    it('should set an active class for the current action', () => {
      var output = Handlebars.helpers.local_files_menu('singles');

      assert.include(output, '<a href="#" class="active">');
      assert.include(output, '<a href="local/albums">');
      assert.include(output, '<a href="local/artists">');
    })
  });
});
