'use strict';

module.exports = class Html {
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

  static glyphicon(name) {
    return Html.tag('span', {class: `glyphicon glyphicon-${name}`}, ' ');
  }
}
