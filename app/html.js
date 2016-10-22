'use strict';

module.exports = class Html {
  /**
   * Generates an HTML tag. For instance:
   *
   *   Html.tag('a', { href: 'meta/index'}, 'Home page')
   *   // => '<a href="meta/index">Home page</a>'
   *   Html.tag('img', { src: 'foo.png'})
   *   // => '<img src="foo.png">'
   *   Html.tag('div', 'box', () => { return "Hello world"})
   *   // => '<div class="box">Hello world</div>'
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
   * @param  {String}   service   - The record's service.
   * @param  {Boolean=} skip_text - Whether to include text
   *                                or not.
   * @return {String}
   */
  static options(service, skip_text) {
    if (service == 'local')
      var mapping = [['time', 'local.sidebar.listen_later',   'listenLater'],
                     ['tags', 'meta.options.tag',             'tag'],
                     ['list', 'meta.options.add_to_playlist', 'addToPlaylist']];
    else
      var mapping = [['share-alt',    'meta.options.share',           'share'],
                     ['download-alt', 'meta.options.download',        'tag'],
                     ['list',         'meta.options.add_to_playlist', 'addToPlaylist']];

    return Html.tag('div', {class: 'options'}, () => {
      return Html.tag('ul', {}, () => {
        var output = '';

        mapping.forEach((set) => {
          output = output.concat(Html.tag('li', {'data-function': set.last()}, () => {
            if (skip_text)
              return Html.glyphicon(set.first());
            else
              return Html.glyphicon(set.first()) + Translation.t(set[1]);
          }));
        });

        return output;
      });
    });
  }

  /**
   * Returns a span having the proper Glyphicon's class.
   *
   * @param  {String} name - The glyph name.
   * @return {String}
   */
  static glyphicon(name) {
    return Html.tag('span', {class: `glyphicon glyphicon-${name}`}, ' ');
  }
}
