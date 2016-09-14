'use strict';

module.exports = class Formatter {
  /**
   * Converts the given number of seconds to a human readable
   * string like "hours:minutes:seconds".
   *
   * If given a string, consider that we are dealing with a
   * YouTube duration in the ISO 8601 format.
   *
   * @param  {Number} duration - The number of seconds.
   * @return {String}
   */
  static time(duration) {
    if (typeof duration == 'string') {
      // Special case when there's no seconds, our trick with
      // the reversed array won't work.
      if (duration.indexOf("M") != -1 && duration.indexOf("S") == -1)
        duration = duration + "0S";

      var components = duration.split(/PT|H|M|S/);
          components = components.filter((c) => { if (c) return c; });
          components = components.reverse();

      var hours   = parseInt(components[2] || 0);
      var minutes = parseInt(components[1] || 0);
      var seconds = parseInt(components[0]);
    } else {
      var hours   = Math.trunc(duration / 3600);
      var minutes = Math.trunc(duration / 60) - (hours * 60);
      var seconds = Math.trunc(duration % 60);
    }

    if (seconds < 10)
      seconds = "0" + seconds;

    if (hours > 0 && minutes < 10)
      minutes = "0" + minutes;

    if (hours == 0)
      return minutes + ":" + seconds;
    else
      return hours + ":" + minutes + ":" + seconds;
  }

  /**
   * Returns a duration in seconds for a given human time.
   * For instance:
   *
   *   duration("2:30") // => 150
   *
   * @param  {String} human_time - A duration in the HH:MM:SS format.
   * @return {Number}
   */
  static duration(human_time) {
    var components = human_time.split(":");
        components = components.reverse();

    var hours   = parseInt(components[2] || 0) * 3600;
    var minutes = parseInt(components[1] || 0) * 60;
    var seconds = parseInt(components[0]);

    return hours + minutes + seconds;
  }

  static relativeTime(timestamp) {
    var diff = this.currentTimestamp() - timestamp;

    if (diff < 60)
      return Translation.t('meta.timing.seconds_ago', {
        number: diff
      });
    else if (diff >= 60 && diff < 3600)
      return Translation.t('meta.timing.minutes_ago', {
        number: Math.trunc(diff / 60)
      });
    else if (diff >= 3600 && diff < (3600 * 24))
      return Translation.t('meta.timing.hours_ago', {
        number: Math.trunc(diff / 3600)
      });
    else if (diff >= (3600 * 24) && diff < (3600 * 24 * 30))
      return Translation.t('meta.timing.days_ago', {
        number: Math.trunc(diff / (3600 * 24))
      });
    else
      return Translation.t('meta.timing.months_ago', {
        number: Math.trunc(diff / (3600 * 24 * 30))
      });
  }

  /**
   * Get the current timestamp in seconds.
   *
   * @return {Number}
   */
  static currentTimestamp() {
    return Math.floor(Date.now() / 1000);
  }

  /**
   * Returns artist name managing edge cases and
   * extracting the account from the title when the
   * passed account refers to a label/record (this
   * is pretty hard to guess so we have a mapping
   * for those that we know).
   *
   * @param  {String} title   - The media's title.
   * @param  {String} account - The media's account.
   * @return {String}
   */
  static artist(title, account) {
    if (title.match(/remix/i))
      var artist = title.split(/(\(|remix\))/i)[2];
    else if (title.indexOf("-") != -1)
      var artist = title.split(" - ")[0];
    else
      var artist = account.replace(/\s\(Official\)/, "");

    return artist.trim();
  }

  /**
   * Returns the exact file's path to store a
   * file that's going to be downloaded based on
   * the title, the artist and the service.
   *
   * @param  {String}  title     - The media's title.
   * @param  {String}  artist    - The media's artist.
   * @param  {String}  service   - The download service.
   * @param  {String=} extension - The file's extension.
   * @return {String}
   */
  static path(title, artist, service, extension) {
    var folder    = Config.read(service, 'download');
    var file_name = title + (extension || ".mp3");

    // Include the artist if there's none already
    // specified (i.e. if there's no '-').
    if (title.indexOf(' - ') == -1 && service == 'soundcloud')
      file_name = artist + ' - ' + file_name;

    return Paths.join(folder, file_name);
  }

  /**
   * Returns the path where the song's cover will be
   * stored.
   *
   * We actually store the artwork in the folder where we
   * store covers that are extracted when reading tags so
   * we don't do extra work when we read the picture tag
   * of this file as we already know it.
   *
   * This method matches the behavior of our tagging
   * library for the image's name (i.e. take the artist
   * and the name of the album or the title if the
   * latter is not present).
   *
   * @param  {String}  url    - The location of the image.
   * @param  {String}  artist - The song's artist.
   * @param  {String}  title  - The song's title.
   * @param  {String=} album  - Eventually the name of the album.
   * @return {String}
   */
  static cover_path(url, artist, title, album) {
    var extension = url.substr(-4, 4);
    var location  = artist + " - ";

    if (album && album != '')
      location = location + album;
    else
      location = location + title;

    location = location + extension;

    return Paths.join(Paths.covers, location);
  }
}
