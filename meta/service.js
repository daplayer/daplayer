'use strict';

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

  static search(value, source, modules) {
    return Promise.resolve({}).then((hash) => {
      if (modules.includes('soundcloud'))
        return SoundCloudService.search(value, source).then((results) => {
          hash.soundcloud = results;

          return hash;
        });

      return hash;
    }).then((hash) => {
      if (modules.includes('youtube'))
        return YouTubeService.search(value, source).then((results) => {
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
}
