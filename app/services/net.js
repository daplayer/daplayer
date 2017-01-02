'use strict';

const fs      = require('fs');
const request = require('request');

module.exports = class NetService {
  static downloadImage(url) {
    // Not "secure" but I guess we don't really mind here.
    var location = '/tmp/' + Formatter.currentTimestamp();

    return this.downloadURL(url, location, false).then(() => {
      return location;
    });
  }

  static downloadURL(url, location, id) {
    return new Promise((resolve, reject) => {
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
          resolve();
        });
      });
    });
  }
}
