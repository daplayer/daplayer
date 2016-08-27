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

    [['soundcloud', 'sc'], ['youtube', 'yt'],
     ['local',   'local'], ['meta', 'meta']].forEach((e) => {

      this.cache[e.last()] = JSON.parse(this.read(e.first(), locale))[e.last()];
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
   * @param  {String} string - The path string.
   * @return {Srtring}
   */
  static t(string) {
    if (!this.loaded)
      this.load();

    var methods = string.split(".");
    var context = this.cache;

    methods.forEach(function(element) {
      context = context[element];
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
