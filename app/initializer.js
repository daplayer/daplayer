// Require most of our dependencies/files here
//
// Not every single dependency/file is required
// here since it's far from ideal to add things
// to the global scope so we require the most
// needed ones here and then, every single file
// has its dependencies required at the top so
// it's easier to use some specific pieces outside
// of the application and it's easier for testing.

// ----------------------------------------------
// Require the core extensions
require('./core_ext');

// ----------------------------------------------
// Libraries
global.$          = require('jquery');
global.Handlebars = require('handlebars');

require('./jquery_ext');

// ----------------------------------------------
// Keep a copy of the native Notification object
// as we are redefining it but need it.
global.NativeNotification = Notification;

// ----------------------------------------------
// Internal components
global.Cache        = require('./cache');
global.Config       = require('./config');
global.Downloads    = require('./downloads');
global.FilePicker   = require('./file_picker');
global.Formatter    = require('./formatter');
global.Html         = require('./html');
global.Notification = require('./notification');
global.Paths        = require('./paths');
global.Queue        = require('./queue');
global.Router       = require('./router');
global.Translation  = require('./translation');
global.Ui           = require('./ui');
global.View         = require('./view');

// ----------------------------------------------
// Mappers to use the proper class based on a
// given service.
require('./mappers');

// ----------------------------------------------
// Models stack
global.Record   = require('./models/record');
global.Playlist = require('./models/playlist');
global.Media    = require('./models/media');
global.Album    = require('./models/album');
global.Activity = require('./models/activity');

// ----------------------------------------------
// Services stack
global.SoundCloudService = require('../soundcloud/service');
global.YouTubeService    = require('../youtube/service');
global.LocalService      = require('../local/service');

global.MetaController = require('../meta/controller');

// ----------------------------------------------
// Helpers stack
require('../soundcloud/helpers');
require('../youtube/helpers');
require('../local/helpers');
require('../meta/helpers');

// ----------------------------------------------
// Display the application's menu
require('./menu');
