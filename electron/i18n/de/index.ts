import { EditMenuMessages, HelpMenuMessages, ViewMenuMessages } from '../types'

const editMenu: EditMenuMessages = {
  'menu.edit.title': 'Bearbeiten',
  'menu.edit.undo': 'Rückgängig',
  'menu.edit.redo': 'Wiederherstellen',
  'menu.edit.cut': 'Ausschneiden',
  'menu.edit.copy': 'Kopieren',
  'menu.edit.paste': 'Einfügen',
  'menu.edit.selectAll': 'Alles auswählen'
}

const helpMenu: HelpMenuMessages = {
  'menu.help.title': 'Hilfe',
  'menu.help.learn': 'Mehr erfahren ...',
  'menu.help.docs': 'Dokumentation',
  'menu.help.telegram': 'Telegram',
  'menu.help.issues': 'Probleme melden'
}

const viewMenu: ViewMenuMessages = {
  'menu.view.title': 'Ansicht',
  'menu.view.reload': 'Neuladen',
  'menu.view.toggleFullscreen': 'Vollbild ein/aus',
  'menu.view.toggleDevTools': 'Dev Tools ein/aus'
}

export default { ...editMenu, ...viewMenu, ...helpMenu }
