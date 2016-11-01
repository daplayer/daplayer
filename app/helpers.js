// --------------------------------------------------------
// Common helpers shared across the application
Handlebars.registerHelper('menu', function(module, section, active) {
  var icons = {
    dashboard:      { configuration: 'cog', downloads: 'download-alt' },
    stream:         { activities: 'headphones', tracks: 'music'},
    playlists:      { liked_playlists: 'heart', user_playlists: 'user' },
    files:          { singles: 'music', artists: 'user' },
    search_results: { soundcloud: 'cloud', youtube: 'film', local: 'music'}
  };

  var html = Html.tag('div', {class: 'navbar'}, () => {
    var output = '';

    Object.keys(icons[section]).forEach((action) => {
      if (action == active)
        var attrs = { href: '#', class: 'active'};
      else if (section == 'search_results')
        var attrs = { href: `${action}/search_results`};
      else
        var attrs = { href: `${module}/${action}`};

      output = output.concat(Html.tag('a', attrs, () => {
        if (section == 'search_results')
          var translation = Translation.t([action, 'name'].join('.'));
        else
          var translation = Translation.t([module, section, action].join('.'));

        return Html.glyphicon(icons[section][action]) + translation;
      }));
    });

    return output;
  });

  return new Handlebars.SafeString(html);
});
