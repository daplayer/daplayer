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

// ----------------------------------------------
// Internal components
global.Cache        = require('./cache');
global.Config       = require('./config');
global.Database     = require('./database');
global.Downloads    = require('./downloads');
global.FilePicker   = require('./file_picker');
global.Formatter    = require('./formatter');
global.Html         = require('./html');
global.Paths        = require('./paths');
global.Record       = require('./record');
global.Router       = require('./router');
global.Translation  = require('./translation');
global.Ui           = require('./ui');
global.View         = require('./view');

// ----------------------------------------------
// Services stack
global.SoundCloudService = require('../soundcloud/service');
global.YouTubeService    = require('../youtube/service');
global.LocalService      = require('../local/service');
global.MetaService       = require('../meta/service');

// ----------------------------------------------
// Meta stack for the models and the controllers
global.MetaModel      = require('../meta/model');
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
