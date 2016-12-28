'use strict';

// Make sure that we have the necessary files created when
// we run the application (e.g. for the first time or if
// the user accidentally deleted the "cache" folder).
const Paths = require('./app/paths');

// > For folders.
Paths.to_make.forEach((folder) => {
  if (!Paths.exists(folder))
    Paths.mkdir(folder);
});

// > For the "YouTube History" playlist files.
if (!Paths.exists('youtube_history'))
  Paths.touchYouTubeHistory();

// Start the Electron "popote".
const electron       = require('electron');
const app            = electron.app;           // Module to control application life.
const BrowserWindow  = electron.BrowserWindow; // Module to create browser window.
const globalShortcut = electron.globalShortcut;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform != 'darwin')
    app.quit();

  globalShortcut.unregisterAll();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 650,
    title: 'DaPlayer',
    autoHideMenuBar: true,
    webgl: false,
    titleBarStyle: 'hidden-inset'
  });

  // and load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + '/index.html');

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

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
  });

  mainWindow.on('focus', function() {
    mainWindow.webContents.send('focus', true);
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
});
