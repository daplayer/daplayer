'use strict';

const fs      = require('fs');
const request = require('request');

module.exports = class NetService {
  static downloadImage(url, artist, title, callback) {
    var location = Formatter.cover_path(url, artist, title);

    this.download(url, location, false, () => {
      callback(location);
    });
  }

  static downloadURL(url, location, id, callback) {
    request.head(url, (err, res, body) => {
      var req = request(url);
      var size, remaining;

      req.pipe(fs.createWriteStream(location));

      if (id) {
        req.on('response', (response) => {
          size      = response.headers['content-length'];
          remaining = size;

          Downloads.grow(size);
        });

        req.on('data', (chunck) => {
          remaining = remaining - chunck.length;

          Downloads.progress(chunck.length);
          Ui.downloadProgress(id, (size - remaining) / size * 100);
        });
      }

      req.on('end', () => {
        callback();
      });
    });
  }
}
