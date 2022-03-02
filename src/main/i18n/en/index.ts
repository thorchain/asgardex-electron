import { EditMenuMessages, HelpMenuMessages, ViewMenuMessages, AppMenuMessages } from '../types'

const appMenu: AppMenuMessages = {
  'menu.app.about': 'About {name}',
  'menu.app.hideApp': 'Hide {name}',
  'menu.app.hideOthers': 'Hide Others',
  'menu.app.unhide': 'Show All',
  'menu.app.quit': 'Quit {name}'
}

const editMenu: EditMenuMessages = {
  'menu.edit.title': 'Edit',
  'menu.edit.undo': 'Undo',
  'menu.edit.redo': 'Redo',
  'menu.edit.cut': 'Cut',
  'menu.edit.copy': 'Copy',
  'menu.edit.paste': 'Paste',
  'menu.edit.selectAll': 'Select all'
}

const helpMenu: HelpMenuMessages = {
  'menu.help.title': 'Help',
  'menu.help.learn': 'Learn more ...',
  'menu.help.docs': 'Documentation',
  'menu.help.discord': 'Discord',
  'menu.help.issues': 'Report issues'
}

const viewMenu: ViewMenuMessages = {
  'menu.view.title': 'View',
  'menu.view.reload': 'Reload',
  'menu.view.toggleFullscreen': 'Toggle Fullscreen',
  'menu.view.toggleDevTools': 'Toggle Dev Tools'
}

export default { ...appMenu, ...editMenu, ...viewMenu, ...helpMenu }
