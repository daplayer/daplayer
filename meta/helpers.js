// --------------------------------------------------------
// Common helpers
Handlebars.registerHelper('size', function(url, size) {
  return url.size(size);
});

Handlebars.registerHelper('r', function(timestamp) {
  return Timing.relativeTime(timestamp);
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
