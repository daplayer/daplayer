// File that manages the application's menu
const template = [
  {
    label: I18n.t('meta.menu.edit.name'),
    submenu: [
      {
        label: I18n.t('meta.menu.edit.cut'),
        accelerator: 'CmdOrCtrl+X',
        role: 'cut'
      },
      {
        label: I18n.t('meta.menu.edit.copy'),
        accelerator: 'CmdOrCtrl+C',
        role: 'copy'
      },
      {
        label: I18n.t('meta.menu.edit.paste'),
        accelerator: 'CmdOrCtrl+V',
        role: 'paste'
      },
      {
        label: I18n.t('meta.menu.edit.selectall'),
        accelerator: 'CmdOrCtrl+A',
        role: 'selectall'
      }
    ]
  },
  {
    label: I18n.t('meta.menu.view.name'),
    submenu: [
      {
        label: I18n.t('meta.menu.view.reload'),
        accelerator: 'CmdOrCtrl+R',
        click(item, focusedWindow) {
          if (focusedWindow) focusedWindow.reload();
        }
      },
      {
        label: I18n.t('meta.menu.view.full_screen'),
        accelerator: process.platform === 'darwin' ? 'Ctrl+Command+F' : 'F11',
        click(item, focusedWindow) {
          if (focusedWindow)
            focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
        }
      },
      {
        label: I18n.t('meta.menu.view.developer_tools'),
        accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
        click(item, focusedWindow) {
          if (focusedWindow)
            focusedWindow.webContents.toggleDevTools();
        }
      },
    ]
  },
  {
    label: I18n.t('meta.menu.window.name'),
    role: 'window',
    submenu: [
      {
        label: I18n.t('meta.menu.window.minimize'),
        accelerator: 'CmdOrCtrl+M',
        role: 'minimize'
      },
      {
        label: I18n.t('meta.menu.window.close'),
        accelerator: 'CmdOrCtrl+W',
        role: 'close'
      },
    ]
  },
  {
    label: I18n.t('meta.menu.help.name'),
    role: 'help',
    submenu: [
      {
        label: I18n.t('meta.menu.help.learn_more'),
        click() { require('electron').shell.openExternal('http://electron.atom.io'); }
      },
    ]
  },
];

if (process.platform === 'darwin') {
  const app  = require('electron').remote.app
  const name = app.getName();

  template.unshift({
    label: name,
    submenu: [
      {
        label: 'About ' + name,
        role: 'about'
      },
      {
        type: 'separator'
      },
      {
        label: 'Services',
        role: 'services',
        submenu: []
      },
      {
        type: 'separator'
      },
      {
        label: 'Hide ' + name,
        accelerator: 'Command+H',
        role: 'hide'
      },
      {
        label: 'Hide Others',
        accelerator: 'Command+Alt+H',
        role: 'hideothers'
      },
      {
        label: 'Show All',
        role: 'unhide'
      },
      {
        type: 'separator'
      },
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click() { app.quit(); }
      },
    ]
  });
  // Window menu.
  template[3].submenu.push(
    {
      type: 'separator'
    },
    {
      label: 'Bring All to Front',
      role: 'front'
    }
  );
}

const Menu     = require('electron').remote.Menu;
const app_menu = Menu.buildFromTemplate(template);

Menu.setApplicationMenu(app_menu);
