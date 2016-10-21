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

const SoundCloudService = require('../soundcloud/service');
const YouTubeService    = require('../youtube/service');
const LocalService      = require('../local/service');

global.Service = class {
  static for(service) {
    if (service == 'soundcloud')
      return SoundCloudService;
    else if (service == 'youtube')
      return YouTubeService;
    else
      return LocalService;
  }
}
