'use strict';

const fs = require('fs');

module.exports = class Translation {
  /**
   * Loads the translation files of each module based on the
   * defined locale and store them in the cache.
   *
   * @param  {String=} locale - Optionally the locale to load,
   *                            otherwise, `Config.meta.locale`
   *                            is used.
   * @return {null}
   */
  static load(locale) {
    var locale = locale || Config.meta.locale;

    if (!this.cache)
      this.cache = {};

    ['soundcloud', 'youtube', 'local', 'meta'].forEach((e) => {
      this.cache[e] = JSON.parse(this.read(e, locale))[e];
     });

    this.loaded = true;
  }

  /**
   * Facility to get access to a specific value. The dot (".")
   * is used to represent the nesting of elements. For instance:
   *
   *   t("meta.foo.bar")
   *
   * is equivalent to accessing:
   *
   *   Translation.cache.meta.foo.bar
   *
   * @param  {String}  string - The path string.
   * @param  {Object=} hash   - Eventual placeholder values.
   * @return {String}
   */
  static t(string, hash) {
    if (!this.loaded)
      this.load();

    // Short-hands to access to the SoundCloud and YouTube
    // translations.
    if (string.startsWith('sc'))
      string = string.replace('sc', 'soundcloud');
    else if (string.startsWith('yt'))
      string = string.replace('yt', 'youtube');

    var methods = string.split(".");
    var context = this.cache;

    methods.forEach(function(element) {
      context = context[element];
    });

    if (hash)
      context = context.replace(/%{(\w+)}/g, (match, p1) => {
        return hash[p1];
      });

    return context;
  }

  /**
   * Facility to read the specific translation file of a
   * module.
   *
   * @param  {String} module - The module to look for.
   * @param  {String} locale - The local to load.
   * @return {String}
   */
  static read(module, locale) {
    var translation_file = `${module}/translations/${locale}.json`;

    return fs.readFileSync(Paths.join(Paths.root, translation_file)).toString();
  }
}
