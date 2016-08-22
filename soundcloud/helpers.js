'use strict';

Handlebars.registerHelper('soundcloud_music_box', function(record) {
  var template = View.compile('soundcloud/partials/music_box');

  return new Handlebars.SafeString(template(record));
});

Handlebars.registerHelper('soundcloud_playlist', function(playlist) {
  var template = View.compile('soundcloud/partials/playlist');

  return new Handlebars.SafeString(template(playlist));
});
