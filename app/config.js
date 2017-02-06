'use strict';

/**
 * Wrapper around the local storage to manage the user
 * configuration.
 *
 * Configuration settings are stored on a per service
 * basis under a service_config key (e.g. `local_config`).
 */
module.exports = class Config {
  /**
   * Returns the configuration for the meta section.
   *
   * @return {Object}
   */
  static get meta() {
    return {
      locale: this.read('meta', 'locale'),
    }
  }

  /**
   * Returns the configuration for the local section.
   *
   * @return {Object}
   */

  static get local() {
    return {
      path:   this.read('local', 'path'),
      volume: this.read('local', 'volume')
    }
  }

  /**
   * Returns the configuration for the SoundCloud section.
   *
   * @return {Object}
   */
  static get soundcloud() {
    return {
      download:       this.read('soundcloud', 'download'),
      volume:         this.read('soundcloud', 'volume'),
      stream_view:    this.read('soundcloud', 'stream_view')
    }
  }

  /**
   * Returns the configuration for the YouTube section.
   *
   * @return {Object}
   */
  static get youtube() {
    return {
      download:          this.read('youtube', 'download'),
      quality:           this.read('youtube', 'quality'),
      related_playlists: this.read('youtube', 'related_playlists'),
      volume:            this.read('youtube', 'volume')
    }
  }

  /**
   * Contains the default configuration settings for all
   * the services.
   *
   * @return {Object}
   */
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
        volume: 1
      },
    }
  }

  /**
   * Reads the configuration setting of a given section reading
   * from the local storage or returning the default value if unset.
   *
   * @param  {String} section - The section to look in.
   * @param  {String} key     - The setting key.
   * @return {Object|String|Number}
   */
  static read(section, key) {
    var hash = JSON.parse(localStorage.getItem(section + '_config') || '{}');

    if (hash[key])
      return hash[key];
    else
      return this.default[section][key];
  }

  /**
   * Stores a given configuration setting in the local storage
   * making sure that the previous values are kept.
   *
   * @param  {String} section - The section to write to.
   * @param  {String} key     - The setting key.
   * @param  {String} value   - The value to set.
   * @return {null}
   */
  static store(section, key, value) {
    var hash = JSON.parse(localStorage.getItem(section + '_config') || '{}');

    hash[key] = value;

    localStorage.setItem(section + '_config', JSON.stringify(hash));
  }
}
