Handlebars.registerHelper('local_playlist', function(playlist) {
  var template = View.compile('local/partials/playlist');

  return new Handlebars.SafeString(template(playlist));
});

Handlebars.registerHelper('listen_later', function(item) {
  var template = View.compile('local/partials/listen_later');

  return new Handlebars.SafeString(template((item)));
});

Handlebars.registerHelper('local_files_menu', function(active) {
  var icons = {
    singles: 'music',
    albums:  'cd',
    artists: 'user'
  };

  var html = Html.tag('div', {class: 'navbar'}, () => {
    var output = '';

    ['singles', 'albums', 'artists'].forEach((entry) => {
      if (entry == active)
        var attrs = {href: '#', class: 'active'};
      else
        var attrs = {href: `local/${entry}`};

      output = output.concat(Html.tag('a', attrs, () => {
        return Html.glyphicon(icons[entry]) +
               Translation.t(`local.files_menus.${entry}`);
      }));
    });

    return output;
  });

  return new Handlebars.SafeString(html);
});
