'use strict';

// Make sure that we have the necessary file created when
// we run the application (e.g. for the first time or if
// the user accidentally deleted the "cache" folder).
const Paths    = require('./app/paths');
const Database = require('./app/database.js');

if (!Paths.exists('user'))
  Paths.mkdir('user');

if (!Paths.exists('covers'))
  Paths.mkdir('covers');

if (!Paths.exists('database'))
  Database.bootstrap();

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

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
});
