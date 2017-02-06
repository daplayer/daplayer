'use strict';

/**
 * Class responsible for generating HTML strings that will
 * be rendered to the user.
 */
module.exports = class Html {
  /**
   * Generates an HTML tag. For instance:
   *
   *     Html.tag('a', { href: 'meta/index'}, 'Home page')
   *     // => '<a href="meta/index">Home page</a>'
   *     Html.tag('img', { src: 'foo.png'})
   *     // => '<img src="foo.png">'
   *     Html.tag('div', 'box', () => { return "Hello world"})
   *     // => '<div class="box">Hello world</div>'
   *
   * @param  {String}           name
   * @param  {Object|String}    attributes
   * @param  {String|Function=} content
   * @return {String}
   */
  static tag(name, attributes, content) {
    var html = `<${name}`;

    if (typeof attributes == 'string')
      html = html.concat(` class="${attributes}"`);
    else
      for (var key in attributes)
        if (attributes[key] != false)
          html = html.concat(` ${key}="${attributes[key]}"`);

    if (!content)
      html = html.concat('>');
    else if (typeof content === 'string')
      html = html.concat(`>${content}</${name}>`);
    else if (typeof content === 'function')
      html = html.concat(`>${content()}</${name}>`);

    return html;
  }

  /**
   * Returns the necessary mark-up to display a media's options
   * for sharing, downloading, tagging or adding a media to
   * a playlist.
   *
   * @param  {String} service - The record's service.
   * @return {String}
   */
  static options(service) {
    if (service == 'local')
      var mapping = [['tags', 'tag',             'tag'],
                     ['list', 'add_to_playlist', 'addToPlaylist']];
    else
      var mapping = [['share-alt',    'share',           'share'],
                     ['download-alt', 'download',        'tag'],
                     ['list',         'add_to_playlist', 'addToPlaylist']];

    return Html.tag('div', {class: 'options'}, () => {
      var output = '';

      mapping.forEach((set) => {
        var attributes = {
          class: 'flat_button',
          'data-function': set.last(),
          title: I18n.t(set[1])
        };

        output = output.concat(Html.tag('div', attributes, () => {
          return Html.glyphicon(set.first());
        }));
      });

      return output;
    });
  }

  /**
   * Returns a `span` having the proper Glyphicon's class.
   *
   * @param  {String} name - The glyph name.
   * @return {String}
   */
  static glyphicon(name) {
    return Html.tag('span', {class: `glyphicon glyphicon-${name}`}, ' ');
  }
}
