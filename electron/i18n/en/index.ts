import { EditMenuMessages, HelpMenuMessages, ViewMenuMessages } from '../types'

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
  'menu.help.telegram': 'Telegram',
  'menu.help.issues': 'Report issues'
}

const viewMenu: ViewMenuMessages = {
  'menu.view.title': 'View',
  'menu.view.reload': 'Reload',
  'menu.view.toggleFullscreen': 'Toggle Fullscreen',
  'menu.view.toggleDevTools': 'Toggle Dev Tools'
}

export default { ...editMenu, ...viewMenu, ...helpMenu }
