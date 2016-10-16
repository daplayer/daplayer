'use strict';

Handlebars.registerHelper('soundcloud_music_bar', function(record) {
  var template = View.compile('soundcloud/partials/music_bar');

  return new Handlebars.SafeString(template(record));
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
  var img  = Html.tag('img', {src: origin.avatar_url.size('tiny')});
  var desc = Translation.t('sc.activities.' + type, {
    user: origin.username
  });

  return new Handlebars.SafeString(img + desc);
});
