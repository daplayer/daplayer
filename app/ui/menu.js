'use strict';

/**
 * This class manages the menu inside the application's bar.
 */
module.exports = class UiMenu {
  static define(module, section) {
    var keys = {
      activities:      'stream',
      tracks:          'stream',
      search_results:  'search_results'
    };

    var key = keys[section];

    if (!key)
      return $('.titlebar nav').html('');

    var icons = {
      stream:         { activities: 'headphones', tracks: 'music'},
      search_results: { soundcloud: 'cloud', youtube: 'film', local: 'music'}
    };

    var output = '';

    Object.keys(icons[key]).forEach((action) => {
      if (action == section || action == module)
        var attrs = { href: '#', class: 'active'};
      else if (section == 'search_results')
        var attrs = { href: `${action}/search_results`};
      else
        var attrs = { href: `${module}/${action}`};

      output = output.concat(Html.tag('a', attrs, () => {
        if (section == 'search_results')
          var translation = I18n.t([action, 'name'].join('.'));
        else
          var translation = I18n.t([module, key, action].join('.'));

        return Html.glyphicon(icons[key][action]) + translation;
      }));
    });

    $('.titlebar nav').html(output);
  }
}
