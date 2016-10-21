'use strict';

const SoundCloudModel = require('../soundcloud/model');
const YouTubeModel    = require('../youtube/model');
const LocalModel      = require('../local/model');

global.Model = class {
  static for(service) {
    if (service == 'soundcloud')
      return SoundCloudModel;
    else if (service == 'youtube')
      return YouTubeModel;
    else
      return LocalModel;
  }
}
