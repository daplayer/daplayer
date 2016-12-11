// --------------------------------------------------------
// Common helpers shared across the application
Handlebars.registerHelper('options', function(scope) {
  return new Handlebars.SafeString(Html.options(scope.data.root.service, true));
});
