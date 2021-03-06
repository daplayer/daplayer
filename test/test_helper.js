'use strict';

require('../app/core_ext');

// Stub the local storage for testing purpose.
global.localStorage = {
  internal_hash: {},
  getItem: function(key) {
    return this.internal_hash[key];
  },
  setItem: function(key, value) {
    this.internal_hash[key] = value;
  },
  clear: function() {
    this.internal_hash = {};
  }
};

global.assert     = require('assert');
global.fs         = require('fs');
global.path       = require('path');
global.Handlebars = require('handlebars');

global.I18n = require('daplayer-i18n');

global.Config = require('../app/config')
global.Cache  = require('../app/cache')
global.Html   = require('../app/html')
global.Timing = require('../app/timing')
global.Paths  = require('../app/paths')
global.View   = require('../app/view')

global.Record   = require('../app/models/record');
global.Playlist = require('../app/models/playlist');
global.Media    = require('../app/models/media');
global.Album    = require('../app/models/album');
global.Activity = require('../app/models/activity');
global.Artist   = require('../app/models/artist');
global.Context  = require('../app/models/context');

const ArtistArtsService = require('../app/services/artist_arts');

global.Service = class {
  static for(service) {
    if (service == 'artist_arts')
      return ArtistArtsService;
  }
}

// Add the `assert.include` helper
assert.include = function(str, sub_string) {
  if (str instanceof Handlebars.SafeString)
    str = str.string;

  var message = `Expected \`${sub_string}\` to be included in:\n${str}`;

  assert(str.includes(sub_string), message);
};
