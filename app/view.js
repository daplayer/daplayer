'use strict';

const Cache = require('./cache');
const fs    = require('fs');

/**
 * This class is a sort of black-box managing views inside
 * the application. It relies on both Handlebars (to generate
 * the HTML from .hbs files) and jQuery to inject the results
 * inside the DOM.
 */
module.exports = class View {
  /**
   * Fills the current page with the result of the template
   * compilation.
   *
   * @param  {String} location - The template's location.
   * @param  {Object} context  - The template's context.
   * @return {null}
   */
  static render(location, context) {
    $('.content').html(this.compile(location)(context));
  }

  /**
   * Appends the result of the template compilation to the
   * current page.
   *
   * The process is stopped if the current action doesn't
   * match with the requested template. Thus, if an action
   * takes too long to load data and the user has clicked
   * on a different one, they won't have elements of the
   * former shown.
   *
   * @param  {String} location - The template's location.
   * @param  {Object} context  - The template's context.
   * @return {null}
   */
  static append(location, context) {
    if (location.split("/").pop() != Cache.current.action)
      return;

    $('.content').append(this.compile(location)(context));
  }

  /**
   * Compiles a template through Handlebars. If the template's
   * already been compiled, we just read it from the cache.
   *
   * @param  {String} location - The template's location.
   * @return {Function}
   */
  static compile(location) {
    if (!Cache.templates[location]) {
      var pathinfo  = location.split("/");
      var module    = pathinfo.shift();
      var view      = pathinfo.join("/");
      var file_path = Paths.join(Paths.root, module, 'views', view + '.hbs');
      var source    = fs.readFileSync(file_path).toString();

      Cache.templates[location] = Handlebars.compile(source);
    }

    return Cache.templates[location];
  }

  /**
   * Facility to define partials as Handlebars helpers. It
   * compiles the given partial, render it and wrap inside
   * a Handlebars safe string.
   *
   * @param  {String} location - The partial's location.
   * @param  {String} name     - The helper's name.
   * @return {null}
   */
  static registerPartial(location, name) {
    Handlebars.registerHelper(name, context => {
      return new Handlebars.SafeString(View.compile(location)(context))
    })
  }
}
