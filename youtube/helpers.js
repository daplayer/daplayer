'use strict';

Handlebars.registerHelper('youtube_playlist_thumbnail', function(playlist) {
  return View.partial('youtube/partials/playlist_thumbnail', playlist);
});
