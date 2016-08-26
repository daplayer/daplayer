'use strict';

const SC = require('../client');

module.exports = class SoundCloudModelFetch {
  static fetch(action, href, limit) {
    if (Cache.soundcloud[action] && !href)
      return Cache.soundcloud[action];

    if (href && action == 'activities')
      var offset = href;
    else if (href)
      var offset = href.split(/&|=/)[1];
    else
      var offset = null;

    return SC.fetch(action, offset, limit).then((response) => {
      var collection;

      if (response.collection)
        collection = response.collection.slice();
      else
        collection = response.tracks;

      return {
        next_href: response.next_href,
        collection: collection.map((record, i, t) => {
          if (action == 'activities') {
            if (record.track)
              var hash = record.track;
            else if (record.playlist)
              var hash = record.playlist;

            hash.origin = record.user;
            hash.type   = record.type;

            return Record.soundcloud(hash);
          } else {
            if (record.track)
              return Record.soundcloud(record.track);
            else if (action == 'playlists' || record.title)
              return Record.soundcloud(record);
            else if (action.endsWith('liked_and_owned') && record.type == 'playlist-like')
              return Record.soundcloud(record.playlist);
          }
        }).filter((record) => {
          if (record)
            return record;
        }).map(MetaModel.mapRecords)
      }
    }).catch((e) => {
      throw e;
    });
  }

  static concatenate(existing, fetched) {
    return new Promise((resolve) => {
      // Sometimes the API gives a `next_href` that will
      // return an empty collection, in this case we can't
      // concatenate so return the exisiting one as is.
      if (fetched.collection.empty()) {
        existing.next_href = null;
        resolve(existing);
      }

      // Make sure that our doubly-linked list has
      // the proper links between new elements.
      var last  = existing.collection.last();
      var first = fetched.collection.first();

      last.next      = first;
      first.previous = last;

      resolve({
        next_href:  fetched.next_href,
        collection: existing.collection.concat(fetched.collection)
      });
    });
  }
}
