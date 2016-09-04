'use strict';

require('../test_helper');

describe('Translation', () => {
  describe('#load', () => {
    it('should load keys according to the defined locale', () => {
      Translation.load('en');
      assert.equal('Download', Translation.t('meta.download'))

      Translation.load('fr');
      assert.equal('Télécharger', Translation.t('meta.download'));
    });
  });

  describe('#t', () => {
    it('should load the translation if it is not already done', () => {
      Translation.loaded = false;

      assert.equal('Download', Translation.t('meta.download'));
      assert.equal(true, Translation.loaded);
    });

    it('should look for loaded translation key', () => {
      Translation.cache = {foo: {bar: "baz"}};

      assert.equal(Translation.t('foo.bar'), 'baz');
    });

    it('should replace placeholders given a hash', () => {
      Translation.cache = {foo: {bar: "Hello %{name}, you are %{age} years old!"}};

      var result = Translation.t('foo.bar', {
        name: 'Jacky',
        age:  20
      });

      assert.equal(result, 'Hello Jacky, you are 20 years old!');
    });
  });

  describe('translation files', () => {
    it('should have the same keys', () => {
      ['meta', 'local', 'soundcloud', 'youtube'].forEach((module) => {
        var fr = JSON.parse(Translation.read(module, 'fr'));
        var en = JSON.parse(Translation.read(module, 'en'));

        var fr_keys = keys(fr);
        var en_keys = keys(en);

        if (fr_keys.length < en_keys.length)
          var missing = 'french';
        else
          var missing = 'english';

        assert.deepEqual(fr_keys, en_keys, `Missing ${missing} translation in the "${module}" module`);
      })
    });
  });
})
