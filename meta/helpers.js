// --------------------------------------------------------
// Common helpers
Handlebars.registerHelper('g', function(name) {
  return new Handlebars.SafeString(Html.glyphicon(name));
});

Handlebars.registerHelper('t', function(string_path) {
  return Translation.t(string_path);
});

Handlebars.registerHelper('a', function(title, account) {
  return Formatter.artist(title, account);
});

Handlebars.registerHelper('size', function(url, size) {
  return url.size(size);
});

Handlebars.registerHelper('r', function(timestamp) {
  return Formatter.relativeTime(timestamp);
});

Handlebars.registerHelper('or', function(a, b) {
  return a || b;
});

// --------------------------------------------------------
// Form helpers
Handlebars.registerHelper('radio', function(id, name, label, section) {
  var i18npath = `${section}.configuration.${label}`;
  var label    = Translation.t(i18npath) || label;

  var input = Html.tag('input', {
    type:    'radio',
    name:    name,
    id:      id,
    value:   id,
    checked: Config[section][name] == id
  });

  var label = Html.tag('label', { for: id}, label);

  return new Handlebars.SafeString(input + label);
});

Handlebars.registerHelper('input', function(id, section, path_selector) {
  var name = section + '_' + id;
  var html = Html.tag('input', {
    type:  'text',
    name:  name,
    id:    name,
    value: Config[section][id]
  });

  if (path_selector)
    html = html.concat(Html.tag('div', {
      class: 'tiny_button',
      'data-field': name
    }, Html.glyphicon('folder-open')));

  return new Handlebars.SafeString(html);
});

// --------------------------------------------------------
// Shared helpers
Handlebars.registerHelper('set_box', function(set) {
  return View.partial('meta/partials/set_box', set);
});

Handlebars.registerHelper('set_item', function(item) {
  return View.partial('meta/partials/set_item', item);
});

Handlebars.registerHelper('playlist_option', function(playlist) {
  return View.partial('meta/partials/playlist_option', playlist);
});

Handlebars.registerHelper('media_box', function(media) {
  return View.partial('meta/partials/media_box', media);
});

Handlebars.registerHelper('search_results_menu', function(search_results, active) {
  var icons = {
    soundcloud: 'cloud',
    youtube:    'film',
    local:      'music'
  };

  var html = Html.tag('div', {class: 'navbar'}, () => {
    var output = '';

    ['soundcloud', 'youtube', 'local'].forEach((module) => {
      if (search_results[module]) {
        if (module == active)
          var attrs = { href: '#', class: 'active' };
        else
          var attrs = { href: `${module}/search_results` };


        output = output.concat(Html.tag('a', attrs, () => {
          return Html.glyphicon(icons[module]) +
                 Translation.t(module.concat('.name'));
        }));
      }
    });

    return output;
  });

  return new Handlebars.SafeString(html);
});

// --------------------------------------------------------
// Helpers for meta controller's actions
Handlebars.registerHelper('dashboard_menu', function(active) {
  var icons = { configuration: 'cog', downloads: 'download-alt' };

  var html = Html.tag('div', {class: 'navbar'}, () => {
    var output = '';

    ['configuration', 'downloads'].forEach((action) => {
      if (action == active)
        var attrs = { href: '#', class: 'active'};
      else
        var attrs = { href: `meta/${action}`};

      output = output.concat(Html.tag('a', attrs, () => {
        return Html.glyphicon(icons[action]) +
               Translation.t('meta.dashboard.' + action);
      }));
    });

    return output;
  });

  return new Handlebars.SafeString(html);
});

Handlebars.registerHelper('download_box', function(media) {
  return View.partial('meta/partials/download_box', media);
});
