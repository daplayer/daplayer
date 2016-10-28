Handlebars.registerHelper('local_files_menu', function(active) {
  var icons = {
    singles: 'music',
    artists: 'user'
  };

  var html = Html.tag('div', {class: 'navbar'}, () => {
    var output = '';

    ['singles', 'artists'].forEach((entry) => {
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
