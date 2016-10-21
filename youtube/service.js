'use strict';

const YouTubeModel = require('./model');
const NetService   = require('../app/services/net');
const Credentials  = require('../app/credentials');
const SubWindow    = require('../app/sub_window');
const querystring  = require('querystring');
const request      = require('request');
const YT           = require('./client');

module.exports = class YouTubeService extends NetService {
  /**
   * Checks whether the access token is still valid and the user
   * can reach oAuth URLs to fetch data.
   *
   * Basically, the expire date of the token is stored when the
   * user give access to their account so we store it and compare
   * it with the current time to check whether it's still valid.
   * If it's not, we just refresh it.
   *
   * @return {Bool}
   */
  static isConnected() {
    if (!Credentials.user.youtube.connected)
      return false;

    var expires_at = Credentials.user.youtube.expires_at;

    if (expires_at > Formatter.currentTimestamp()) {
      return true;
    } else if (expires_at && expires_at < Formatter.currentTimestamp()) {
      this.refreshToken();
      return true;
    } else {
      return false;
    }
  }

  /**
   * Just trigger the process to refresh a token if the user
   * isn't connected (i.e. doesn't have a sufficiently fresh
   * token to pull data from the API).
   *
   * This method is a pure alias to `isConnected`; the name
   * just better shows our intent here.
   *
   * @return {null}
   */
  static connect() {
    this.isConnected();
  }

  /**
   * Hits oAuth url to get a new access token from the existing
   * refresh token.
   *
   * @return {null}
   */
  static refreshToken() {
    var parameters = {
      client_id:     Credentials.youtube.client_id,
      client_secret: Credentials.youtube.client_secret,
      refresh_token: Credentials.user.youtube.refresh_token,
      grant_type:    'refresh_token'
    };

    request.post(YT.url.token, { form: parameters }, (err, response, body) => {
      var credentials = JSON.parse(body);

      this.storeCredentials(credentials, true);
    });
  }

  /**
   * Displays a new window hitting Google's interface to let the
   * user allow the application to be connected to their account.
   * Once authorized, trigger the process to get an access token.
   *
   * @return {null}
   */
  static signin() {
    var parameters = {
      response_type: 'code',
      access_type:   'offline',
      client_id:     Credentials.youtube.client_id,
      scope:         encodeURI(Credentials.youtube.scope),
      redirect_uri:  encodeURI(Credentials.youtube.redirect_uri)
    };

    var auth_url    = YT.url.auth + '?' + querystring.stringify(parameters);
    var auth_window = new SubWindow(600, 400);

    auth_window.load(auth_url);
    auth_window.show();

    // Whenever the URL of the page changes, we check whether the
    // new URL contains a `code` parameter and then we request a
    // token with this code and close the window.
    auth_window.on('redirect', (event, old_url, new_url) => {
      if (new_url.match(/code=/)) {
        YouTubeService.requestToken(new_url);
        auth_window.close();
      }
    });
  }

  /**
   * Requests a token from a given code when the user accepts to
   * connect their YouTube account. The given token is then
   * stored on the user's computer.
   *
   * @param  {String} url - The returned URL when auth is given.
   * @return {null}
   */
  static requestToken(url) {
    var params = {
        code:          url.split(/code=/)[1],
        client_id:     Credentials.youtube.client_id,
        client_secret: Credentials.youtube.client_secret,
        redirect_uri:  Credentials.youtube.redirect_uri,
        grant_type:    'authorization_code'
    };

    request.post(YT.url.token, { form: params }, (e, r, body) => {
      YouTubeService.storeCredentials(body, false);
    });
  }

  /**
   * Facility to store the credentials and the expire date of
   * the token inside the user's configuration file.
   *
   * @param  {Object|String} credentails - The credentials.
   * @return {null}
   */
  static storeCredentials(credentials, refreshing_token) {
    if (typeof credentials === 'string')
      credentials = JSON.parse(credentials);

    // Avoid to loose the refresh-token as it is not given
    // again when we are requesting a refresh.
    if (Credentials.user.youtube.refresh_token)
      credentials.refresh_token = Credentials.user.youtube.refresh_token;

    credentials.expires_at = Formatter.currentTimestamp() + credentials.expires_in;
    credentials.connected  = true;

    delete credentials.expires_in;

    Credentials.store('youtube', credentials);

    // Calculate the account's related playlists and store them
    // inside the user configuration because they won't change
    // unless another account is connected.
    if (!refreshing_token)
      YT.fetchRelatedPlaylists();
  }

  /**
   * Disconnects the YouTube account from the application by
   * removing the credentials stored in the local storage and
   * by allowing to revoke access to the application on its
   * Google account.
   *
   * @return {null}
   */
  static signout() {
    var auth_window = new SubWindow(600, 400);

    auth_window.load(YT.url.revoke);
    auth_window.show();

    auth_window.on('close', () => {
      Credentials.remove('youtube');

      auth_window.close();
    });
  }

  /**
   * Retrieve video URL from a given video id.
   * It basically goes like:
   *
   *   - Hit YouTube's get_video_info endpoint to get video's info.
   *   - Check whether the video is signed or not.
   *   - If it's signed, decrypt the signature.
   *   - Build an URL upon the last check.
   *
   * @param  {String} id - The video's id.
   * @return {Promise}
   */
  static videoURL(id) {
    // If the URL has already been computed, let's
    // return it from the cache.
    if (Cache.youtube.video_urls[id])
      return Cache.youtube.video_urls[id];

    var options = { video_id: id, el: 'detailpage' };

    return new Promise((resolve, reject) => {
      request.get(YT.url.info, { qs: options }, (error, response, body) => {
        if (error)
          reject(error);

        var video_info = querystring.parse(body);
        var streams = String(video_info.url_encoded_fmt_stream_map).split(',');

        streams.forEach((stream, index) => {
          streams[index] = querystring.parse(stream);
        });

        var stream = streams[0];
        var url    = stream.url.replace(/%2C/g, ",");
        var type   = stream.type;

        if (stream.s) {
          this.decrypt(stream.s, id).then((signature) => {
            var result = {
              id: id,
              url: `${url}&signature=${signature}`,
              type: type
            };

            Cache.add('youtube', 'video_urls', result);
            resolve(result);
          });
        } else {
          var result = {
            id: id,
            url: url,
            type: type
          };

          Cache.add('youtube', 'video_urls', result);
          resolve(result);
        }
      });
    });
  }

  /**
   * Fetches the decrypting function for a video that has
   * a signature and evaluate it inside our scope to decrypt
   * the signature.
   *
   * This is one is pretty tricky.
   *
   * @param  {String} signature - The video's signature.
   * @param  {String} id        - The video's id.
   * @return {Promise}
   */
  static decrypt(signature, id) {
    var video_url = YT.url.watch + id;

    return new Promise((resolve, reject) => {
      request(video_url, (error, response, body) => {
        if (error)
          reject(error);

        // We try to find the script's URL of the video
        // that contains the decrypting function.
        var script_url = body.match(/"js":"(.*?)"/i)[1];
            script_url = script_url.replace(/\\\//g, "/");
            script_url = "http:" + script_url;

        // Once we know the location of the script, we try
        // to extract the decrypting function from it and
        // evaluate it in our scope to decrypt the video's
        // signature.
        request(script_url, (error, response, jscode) => {
          if (error)
            reject(error);

          var fname = jscode.match(/\.set\("signature",(.*?)\(/)[1];
          var fbody = "";
          var pos   = jscode.indexOf(fname + "=function");

          // Copy the very beginning of the function
          // (i.e. untile the '{').
          for (; jscode[pos-1] != '{'; pos++)
            fbody += jscode[pos];

          // Copy the function's body
          for (var braces = 1; braces > 0; pos++) {
            fbody += jscode[pos];

            if (jscode[pos] == '{')
              braces++;
            else if (jscode[pos] == '}')
              braces--;
          }

          var parameters = fbody.split("function")[1].match(/\((\w+|,)+\)/)[0];
              parameters = parameters.slice(1, -1).split(",");
          var inner_obj  = fbody.match(/\w+\.\w+/g);

          // Copy the code of the inner object.
          if (inner_obj) {
            inner_obj = inner_obj.filter((e) => {
              return parameters.indexOf(e[0]) == -1;
            });

            inner_obj = inner_obj[0].split(".")[0];

            var match_str = `var ${inner_obj}=`, code = "{";
            var position  = jscode.indexOf(match_str) + match_str.length + 1;

            for (var braces = 1; braces > 0; position++) {
              code += jscode[position];

              if (jscode[position] == '{')
                braces++;
              else if (jscode[position] == '}')
                braces--;
            }

            fbody = fbody.replace(new RegExp(inner_obj + "\\.", "g"), "YouTubeService.inner_obj.");

            eval('YouTubeService.inner_obj = ' + code);
          }

          // Pretty hacky but we don't have any better
          // solution for now.
          eval('YouTubeService.youtube_decrypt = ' + fbody.split(fname + "=")[1]);

          resolve(YouTubeService.youtube_decrypt(signature));
        });
      });
    });
  }

  /**
   * Fetches the download URL of MP3 file attached to the
   * given video's id.
   *
   * @param  {String} id - The video's id.
   * @return {Promise}
   */
  static mp3URL(id) {
    return new Promise((resolve, reject) => {
      var hidden_window = new SubWindow();
      var web_contents  = hidden_window.webContents;

      var url         = YT.url.watch + id;
      var update_code = `document.querySelector('#youtube-url').value = '${url}';`+
                        `document.querySelector('#submit').click()`;
      var href_code   = `document.querySelector('#dl_link a:not([style])').href`;

      hidden_window.on('did-finish-load', () => {
        web_contents.executeJavaScript(update_code);
      });

      hidden_window.on('did-get-response-details', (a, b, url, d, e, f, g, h, type) => {
        if (type == 'image' && url.startsWith('http://i.ytimg'))
          web_contents.executeJavaScript(href_code, false, (mp3_url) => {
            hidden_window.close(true);

            resolve(mp3_url);
          });
      });

      hidden_window.load(YT.url.mp3);
    });
  }

  /**
   * Dispatches to the associated's format download function.
   *
   * @param  {Object} tags        - The tags to associate.
   * @param  {String} tags.id     - The video's id.
   * @param  {String} tags.title  - The media's title.
   * @param  {String} tags.icon   - The media's icon.
   * @param  {String} tags.format - The format to download the
   *                                media in.
   * @return {null}
   */
  static download(tags) {
    if (tags.format == 'mp3')
      this.downloadMP3(tags);
    else
      this.downloadVideo(tags);
  }

  /**
   * Downloads a video's MP3 counterpart based on the given
   * id. The given title, artist and icon are given to display
   * a nofication when the download starts/ends or for
   * tagging the file.
   *
   * @param  {Object} tags        - The tags to associate.
   * @param  {String} tags.id     - The video's id.
   * @param  {String} tags.title  - The song's title.
   * @param  {String} tags.icon   - The song's icon.
   * @return {null}
   */
  static downloadMP3(tags) {
    Downloads.enqueue(tags);
    Ui.downloadStart(tags);

    var location = Formatter.path(tags.title, null, 'youtube');

    this.mp3URL(tags.id).then((url) => {
      this.downloadURL(url, location, tags.id, (request) => {
        Ui.downloadEnd(Downloads.dequeue(tags.id));

        LocalService.tag(location, {
          title: tags.title
        });
      });
    });
  }

  /**
   * Downloads a video based on the given id. The title and
   * icon parameters are specified to display a notication
   * when the download starts/ends.
   *
   * @param  {String} id     - The video's id.
   * @param  {String} title  - The video's title.
   * @param  {String} icon   - The video's icon.
   * @return {null}
   * @deprecated
   */
  static downloadVideo(tags) {
    var hash = {
      id:    id,
      title: title,
      icon:  icon
    };

    Downloads.enqueue(hash);
    Ui.downloadStart(hash);

    this.videoURL(id).then((url) => {
      var extension = '.' + url.type.split(';')[0].split('/')[1];
      var location  = Formatter.path(title, null, 'youtube', extension);

      this.downloadURL(url.url, location, id, (request) => {
        Ui.downloadEnd(Downloads.dequeue(id));
      });
    });
  }

  /**
   * Searches a record from the user's playlists or on YouTube.
   *
   * The search by artist is kind of disabled; we ignore
   * the fact that a query begins with '@' since the artist
   * is part of the title and the channel names are mostly
   * not reliable (e.g. BMTHOfficialVEVO -> Bring Me The
   * Horizon).
   *
   * @return {Promise}
   */
  static search() {
    var {query, source} = Cache.search;

    if (['@', '#'].includes(query[0]))
      query = query.slice(1);

    if (source == 'internet')
      return YouTubeModel.netSearch(query);

    query = new RegExp(query, 'i');

    return YouTubeModel.playlists().then((playlists) => {
      return {
        items: playlists.items.filter((playlist) => {
          return playlist.title.match(query);
        })
      }
    });
  }
}
