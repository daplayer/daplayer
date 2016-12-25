'use strict';

module.exports = class Config {
  static get meta() {
    return {
      locale:         this.read('meta', 'locale'),
      dashboard_view: this.read('meta', 'dashboard_view')
    }
  }

  static get local() {
    return {
      path:       this.read('local', 'path'),
      volume:     this.read('local', 'volume'),
      files_view: this.read('local', 'files_view')
    }
  }

  static get soundcloud() {
    return {
      download:       this.read('soundcloud', 'download'),
      volume:         this.read('soundcloud', 'volume'),
      stream_view:    this.read('soundcloud', 'stream_view')
    }
  }


  static get youtube() {
    return {
      download:          this.read('youtube', 'download'),
      quality:           this.read('youtube', 'quality'),
      related_playlists: this.read('youtube', 'related_playlists'),
      volume:            this.read('youtube', 'volume')
    }
  }

  static get default() {
    return {
      meta: {
        locale: 'en',
        dashboard_view: 'configuration'
      },
      soundcloud: {
        download: '',
        volume: 1,
        stream_view: 'activities'
      },
      youtube: {
        download: '',
        quality: 360,
        related_playlists: {},
        volume: 1
      },
      local: {
        path: Paths.music_folder,
        volume: 1,
        files_view: 'single_files'
      },
    }
  }

  static read(section, key) {
    var hash = JSON.parse(localStorage.getItem(section + '_config') || '{}');

    if (hash[key])
      return hash[key];
    else
      return this.default[section][key];
  }

  static store(section, key, value) {
    var hash = JSON.parse(localStorage.getItem(section + '_config') || '{}');

    hash[key] = value;

    localStorage.setItem(section + '_config', JSON.stringify(hash));
  }
}
