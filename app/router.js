'use strict';

/**
 * This class handles the routing, dispatching links to the
 * proper controler/action when needed.
 */
module.exports = class Router {
  static setFavoriteRouteFor(href) {
    var parts   = href.split('/');
    var mapping = {
      activities: 'stream_view',
      tracks:     'stream_view'
    };

    parts.splice(1, 0, mapping[parts[1]]);

    Config.store.apply(null, parts);
  }

  static to(href) {
    // Special case some hrefs that should be dispatched
    // to other endpoints since they should render the
    // last action picked by the user.
    //
    // * soundcloud/stream
    //     - soundcloud/activities
    //     - soundcloud/tracks
    if (href == 'soundcloud/stream')
      return Config.soundcloud.stream_view;
    else
      return href.split("/").last();
  }

  static from(module, action) {
    // Reversed method of `to` expect for `local/artist` which is
    // just special cased to make sure that the equalizer is shown
    // at the right place:
    //
    // * soundcloud/{activities,tracks} => soundcloud/stream
    // * local/artist                   => local/artists
    if (module == 'soundcloud' && ['activities', 'tracks'].includes(action))
      return 'soundcloud/stream';
    else if (module == 'local' && action == 'artist')
      return 'local/artists';
    else
      return [module, action].join("/");
  }
}
