require('../test_helper');

describe('Html', () => {
  describe('#tag', () => {
    it('should generate a tag based on given attributes', () => {
      var output = Html.tag('input', {type: 'text', name: 'firstname'});

      assert.equal(output, '<input type="text" name="firstname">');
    });

    it('should generate an auto-closing tag if no content is given', () => {
      var output = Html.tag('br');

      assert.equal(output, '<br>');
    });

    it('should generate the closing tag if a string content is given', () => {
      var output = Html.tag('strong', {}, 'muscles');

      assert.equal(output, '<strong>muscles</strong>');
    });

    it('should evalute the given closure for content', () => {
      var output = Html.tag('strong', {class: 'foo'}, function() {
        return 1 + 2;
      });

      assert.equal(output, '<strong class="foo">3</strong>')
    });

    it('should skip the false boolean fields', () => {
      var output = Html.tag('input', {checked: false});

      assert.equal(output, '<input>');
    })
  });

  describe('#options', () => {
    beforeEach(() => {
      Translation.load('en');
    });

    it('should add the adequate options for local files', () => {
      var output = Html.options('local');

      assert.include(output, '<li data-function="listenLater">');
      assert.include(output, '<li data-function="tag">');
      assert.include(output, '<li data-function="addToPlaylist">');

      assert.include(output, Translation.t('local.sidebar.listen_later'));
      assert.include(output, Translation.t('meta.options.tag'));
      assert.include(output, Translation.t('meta.options.add_to_playlist'));
    });

    it('should add the adequate options for SoundCloud and YouTube records', () => {
      var sc_output = Html.options('soundcloud');
      var yt_output = Html.options('youtube');

      assert.equal(sc_output, yt_output);

      assert.include(sc_output, '<li data-function="share">');
      assert.include(sc_output, '<li data-function="tag">');
      assert.include(sc_output, '<li data-function="addToPlaylist">');

      assert.include(sc_output, Translation.t('meta.options.share'));
      assert.include(sc_output, Translation.t('meta.options.download'));
      assert.include(sc_output, Translation.t('meta.options.add_to_playlist'));
    });
  });

  describe('#glyphicon', () => {
    it('should generate a span with the right class name', () => {
      var output = Html.glyphicon('send');

      assert.equal(output, '<span class="glyphicon glyphicon-send"> </span>')
    });
  });
});
