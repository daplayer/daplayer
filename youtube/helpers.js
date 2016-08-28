'use strict';

Handlebars.registerHelper('youtube_playlist_thumbnail', function(playlist) {
  var template = View.compile('youtube/partials/playlist_thumbnail');
  var context  = playlist;

  return new Handlebars.SafeString(template(context));
});
