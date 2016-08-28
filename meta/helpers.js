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

// --------------------------------------------------------
// Form helpers
Handlebars.registerHelper('radio', function(id, name, label, section) {
  var keys     = { youtube: 'yt', soundcloud: 'sc', local: 'local', meta: 'meta' };
  var i18npath = `${keys[section]}.configuration.${label}`;
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
  var value = Config[section][id];
  var name  = section + '_' + id;

  var html = Html.tag('input', {
    type:  'text',
    name:  name,
    id:    name,
    value: value
  });

  if (path_selector)
    html = html.concat(Html.tag('div', {
      class: 'tiny_button',
      'data-field': section
    }, Html.glyphicon('folder-open')));

  return new Handlebars.SafeString(html);
});

// --------------------------------------------------------
// Shared helpers
Handlebars.registerHelper('playlist_item', function(item) {
  var template = View.compile('meta/partials/playlist_item');
  var context  = item;

  context.klass = item.service == 'youtube' ? 'video' : 'music';

  if (context.service == 'soundcloud')
    context.icon = context.icon.size('badge');

  return new Handlebars.SafeString(template(context));
});

Handlebars.registerHelper('playlist_option', function(playlist) {
  var template = View.compile('meta/partials/playlist_option');
  var context  = playlist;

  context.klass = context.service == 'youtube' ? 'video' : 'music';

  return new Handlebars.SafeString(template(context));
});

Handlebars.registerHelper('media_box', function(media) {
  var template = View.compile('meta/partials/media_box');

  return new Handlebars.SafeString(template(media));
});

Handlebars.registerHelper('search_results_menu', function(search_results, active) {
  var icons = {
    soundcloud: 'cloud',
    youtube:    'film',
    local:      'music'
  };

  var name_mapping = {
    soundcloud: 'sc', youtube: 'yt', local: 'local'
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
                 Translation.t(name_mapping[module].concat('.name'));
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
  var template = View.compile('meta/partials/download_box');
  var context  = media;

  return new Handlebars.SafeString(template(context));
});
