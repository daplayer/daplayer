'use strict';

module.exports = class Router {
  static setFavoriteRouteFor(href) {
    var parts   = href.split('/');
    var mapping = {
      configuration: 'dashboard_view',
      downloads:     'dashboard_view',
      activities:    'stream_view',
      tracks:        'stream_view',
      singles:       'files_view',
      artists:       'files_view'
    }

    parts.splice(1, 0, mapping[parts[1]]);

    Config.store.apply(null, parts);
  }

  static to(href) {
    // Special case some hrefs that should be dispatched
    // to other endpoints since they should render the
    // last action picked by the user.
    //
    // * meta/dashboard
    //     - meta/configuration
    //     - meta/downloads
    // * soundcloud/stream
    //     - soundcloud/activities
    //     - soundcloud/tracks
    // * local/files
    //     - local/single_files
    //     - local/artists
    if (href == 'meta/dashboard')
      return Config.meta.dashboard_view;
    else if (href == 'soundcloud/stream')
      return Config.soundcloud.stream_view;
    else if (href == 'local/files')
      return Config.local.files_view;
    else
      return href.split("/").last();
  }

  static from(module, action) {
    // Reversed method of `to` expect for `local/artist` which is
    // just special cased to make sure that the equalizer is shown
    // at the right place:
    //
    // * meta/{configuration,downloads}     => meta/dashboard
    // * soundcloud/{activities,tracks}     => soundcloud/stream
    // * soundcloud/{liked,user}_playlists  => soundcloud/playlists
    // * local/{singles,artists, artist}    => local/files
    if (module == 'meta' && ['configuration', 'downloads'].includes(action))
      return 'meta/dashboard';
    else if (module == 'soundcloud' && ['activities', 'tracks'].includes(action))
      return 'soundcloud/stream';
    else if (module == 'local' && ['singles', 'artists', 'artist', 'search_results'].includes(action))
      return 'local/files';
    else
      return [module, action].join("/");
  }
}
