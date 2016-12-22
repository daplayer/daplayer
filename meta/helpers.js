// --------------------------------------------------------
// Common helpers
Handlebars.registerHelper('g', function(name) {
  return new Handlebars.SafeString(Html.glyphicon(name));
});

Handlebars.registerHelper('t', function(string_path) {
  return I18n.t(string_path);
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

// --------------------------------------------------------
// Form helpers
Handlebars.registerHelper('radio', function(id, name, label, section) {
  var i18npath = `${section}.configuration.${label}`;
  var label    = I18n.t(i18npath) || label;

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
      'data-field': name,
      'data-picker': 'directory'
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

Handlebars.registerHelper('media_details', function(media) {
  return View.partial('meta/partials/media_details', media);
});

// --------------------------------------------------------
// Helpers for meta controller's actions
Handlebars.registerHelper('download_box', function(media) {
  return View.partial('meta/partials/download_box', media);
});
