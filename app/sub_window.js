'use strict';

const BrowserWindow = require('electron').remote.BrowserWindow;

/**
 * This class is a wrapper around the Electron's `BrowserWindow`
 * API to create windows within the application.
 */
module.exports = class SubWindow {
  /**
   * Creates a new sub-window.
   *
   * @param {Number} width  - The window's width.
   * @param {Number} height - The window's height.
   */
  constructor(width, height) {
    this.window = new BrowserWindow({
      width:           width,
      height:          height,
      show:            false,
      autoHideMenuBar: true,
      webPreferences:  {
        nodeIntegration: false
      }
    });

    this.window.on('closed', () => {
      this.window = null;
    });
  }

  /**
   * Loads the given URL (delegates to BrowserWindow#load).
   *
   * @param  {String} url - The URL to load.
   * @return {null}
   */
  load(url) {
    this.window.loadURL(url);
  }

  /**
   * Delegates to BrowserWindow#show.
   *
   * @return {null}
   */
  show() {
    this.window.show();
  }

  /**
   * Registers a specific event handler. Simply delegates to
   * the window's webcontents' `on` method.
   *
   * `"redirect"` can be passed as a short-hand for the
   * `"did-get-redirect-request"` event.
   *
   * @param  {String}   event    - The event to listen.
   * @param  {Function} callback - The function to trigger when
   *                               the event happens.
   * @return {null}
   */
  on(event, callback) {
    if (event == 'redirect')
      this.window.webContents.on('did-get-redirect-request', callback);
    else
      this.window.webContents.on(event, callback);
  }

  /**
   * Delegates to BrowserWindow#close.
   *
   * @param  {Boolean=} avoid_refresh - Whether to avoid the
   *                                    refresh or not closing.
   * @return {null}
   */
  close(avoid_refresh) {
    if (!avoid_refresh)
      Page.refresh()

    this.window.close();
  }

  /**
   * Short-hand to check whether the window is destroyed or
   * not. This automatically returns true if the window is
   * null.
   *
   * @return {Boolean}
   */
  isDestroyed() {
    if (this.window)
      return this.window.isDestroyed();

    return true;
  }

  /**
   * Returns the window's webContents.
   *
   * @return {WebContents}
   */
  get webContents() {
    return this.window.webContents;
  }
}
