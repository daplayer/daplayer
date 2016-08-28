'use strict';

Handlebars.registerHelper('soundcloud_music_bar', function(record) {
  var template = View.compile('soundcloud/partials/music_bar');

  return new Handlebars.SafeString(template(record));
});

Handlebars.registerHelper('soundcloud_playlist', function(playlist) {
  var template = View.compile('soundcloud/partials/playlist');

  return new Handlebars.SafeString(template(playlist));
});

Handlebars.registerHelper('soundcloud_activity_icon', function(type) {
  var mapping = {
    'track-repost':    'retweet',
    'playlist-repost': 'retweet',
    'track':           'music',
    'playlist':        'list',
  }

  return Handlebars.helpers.g(mapping[type]);
});

Handlebars.registerHelper('soundcloud_activity_desc', function(origin, type) {
  var key  = 'sc.activities.' + type;
  var desc = `${origin.username} ${Translation.t(key)}`;
  var img  = Html.tag('img', {src: origin.avatar_url.size('tiny')});

  return new Handlebars.SafeString(img + desc);
});
