'use strict';

const fs      = require('fs');
const path    = require('path');
const request = require('request');

const YouTubeModel = require('../youtube/model');

module.exports = class MetaService {
  static dispatch(set) {
    var set    = set.split(/#|:/).slice(-2);
    var module = set.first(), action = set.last();

    if (module == 'soundcloud')
      SoundCloudService[action].call();
    else if (module == 'youtube')
      YouTubeService[action].call();
    else if (module == 'local')
      LocalService[action].call();
    else
      MetaService[action].call();
  }

  static search(value, modules) {
    return Promise.resolve({}).then((hash) => {
      if (modules.includes('soundcloud'))
        return SoundCloudModel.search(value).then((results) => {
          hash.soundcloud = results;

          return hash;
        });

      return hash;
    }).then((hash) => {
      if (modules.includes('youtube'))
        return YouTubeModel.search(value).then((results) => {
          hash.youtube = results;

          return hash;
        });

      return hash;
    }).then((hash) => {
        if (modules.includes('local'))
          return LocalService.search(value).then((results) => {
            hash.local = results;

            Cache.search_results = hash;

            return hash;
          });
        else
          Cache.search_results = hash;

        return hash;
    });
  }

  static downloadImage(url, artist, title, callback) {
    var location = Formatter.cover_path(url, artist, title);

    this.download(url, location, (req) => {
      req.on('end', () => {
        callback(location);
      })
    });
  }

  static download(url, location, callback) {
    request.head(url, (err, res, body) => {
      var req = request(url);

      req.pipe(fs.createWriteStream(location));

      callback(req);
    });
  }
}
