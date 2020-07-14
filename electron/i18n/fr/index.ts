import { EditMenuMessages, HelpMenuMessages, ViewMenuMessages } from '../types'

const editMenu: EditMenuMessages = {
  'menu.edit.title': 'Edit - FR',
  'menu.edit.undo': 'Undo - FR',
  'menu.edit.redo': 'Redo - FR',
  'menu.edit.cut': 'Cut - FR',
  'menu.edit.copy': 'Copy - FR',
  'menu.edit.paste': 'Paste - FR',
  'menu.edit.selectAll': 'Select all - FR'
}

const helpMenu: HelpMenuMessages = {
  'menu.help.title': 'Help - FR',
  'menu.help.learn': 'Learn more ... - FR',
  'menu.help.docs': 'Documentation - FR',
  'menu.help.telegram': 'Telegram - FR',
  'menu.help.issues': 'Issues - FR'
}

const viewMenu: ViewMenuMessages = {
  'menu.view.title': 'View - FR',
  'menu.view.reload': 'Reload - FR',
  'menu.view.toggleFullscreen': 'Toggle Fullscreen - FR',
  'menu.view.toggleDevTools': 'Toggle Dev Tools - FR'
}

export default { ...editMenu, ...viewMenu, ...helpMenu }
