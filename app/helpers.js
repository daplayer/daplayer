// --------------------------------------------------------
// Common helpers shared across the application
Handlebars.registerHelper('options', function(scope) {
  return new Handlebars.SafeString(Html.options(scope.data.root.service, true));
});

Handlebars.registerHelper('pluralize', function(count, word) {
  return I18n.pluralize(count, word);
});

Handlebars.registerHelper('titleize', function(word) {
  return I18n.titleize(word);
});
