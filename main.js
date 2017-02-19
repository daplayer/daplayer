'use strict';

const electron       = require('electron')
const app            = electron.app
const BrowserWindow  = electron.BrowserWindow
const globalShortcut = electron.globalShortcut

const path = require('path')
const url  = require('url')

// Make sure that the users have the different folders
// and files needed to properly use the application.
require('./app/application').ensurePathsExist()

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 650,
    title: 'DaPlayer',
    autoHideMenuBar: true,
    webgl: false,
    titleBarStyle: 'hidden-inset'
  })

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes:  true
  }))

  // --------------------------------------------------------
  // Global shortcuts
  //
  // * MediaPreviousTrack : Play the previous track
  // * MediaPlayPause : Play or pause the current media
  // * MediaNextTrack : Play the next track
  globalShortcut.register('MediaPreviousTrack', function() {
    mainWindow.webContents.send('controls', 'previous');
  });

  globalShortcut.register('MediaPlayPause', function() {
    mainWindow.webContents.send('controls', 'play-pause');
  });

  globalShortcut.register('MediaNextTrack', function() {
    mainWindow.webContents.send('controls', 'next');
  });

  // --------------------------------------------------------
  // Update the focus state of the main window.
  mainWindow.on('blur', function() {
    mainWindow.webContents.send('focus', false);
  })

  mainWindow.on('focus', function() {
    mainWindow.webContents.send('focus', true);
  })

  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin')
    app.quit()
})

app.on('activate', function () {
  if (mainWindow === null)
    createWindow()
})
