// --------------------------------------------------------
// Common helpers shared across the application
Handlebars.registerHelper('options', function(scope) {
  return new Handlebars.SafeString(Html.options(scope.data.root.service));
});

Handlebars.registerHelper('pluralize', function(count, word) {
  return I18n.pluralize(count, word);
});

Handlebars.registerHelper('titleize', function(word) {
  return I18n.titleize(word);
});

Handlebars.registerHelper('g', function(name) {
  return new Handlebars.SafeString(Html.glyphicon(name));
});

Handlebars.registerHelper('t', function(string_path) {
  return I18n.t(string_path);
});

Handlebars.registerHelper('interpolate', function(string_path, scope) {
  return new Handlebars.SafeString(I18n.t(string_path, scope.data.root));
});
