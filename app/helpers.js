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

// --------------------------------------------------------
// Shared partials
View.registerPartial('app/partials/media_box', 'media_box')
View.registerPartial('app/partials/playlist_option', 'playlist_option')
View.registerPartial('app/partials/set_box', 'set_box')
View.registerPartial('app/partials/set_item', 'set_item')

// --------------------------------------------------------
// Meta partials
View.registerPartial('meta/partials/download_box', 'download_box')

// --------------------------------------------------------
// SoundCloud partials
View.registerPartial('soundcloud/partials/music_bar', 'soundcloud_music_bar')

// --------------------------------------------------------
// YouTube partials
View.registerPartial('youtube/partials/playlist_thumbnail', 'youtube_playlist_thumbnail')
