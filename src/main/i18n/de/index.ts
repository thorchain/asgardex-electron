import { EditMenuMessages, HelpMenuMessages, ViewMenuMessages, AppMenuMessages } from '../types'

const appMenu: AppMenuMessages = {
  'menu.app.about': 'Über {name}',
  'menu.app.hideApp': '{name} ausblenden',
  'menu.app.hideOthers': 'Andere ausblenden',
  'menu.app.unhide': 'Zeige alle',
  'menu.app.quit': '{name} beenden'
}

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
  'menu.help.discord': 'Discord',
  'menu.help.issues': 'Probleme melden'
}

const viewMenu: ViewMenuMessages = {
  'menu.view.title': 'Ansicht',
  'menu.view.reload': 'Neuladen',
  'menu.view.toggleFullscreen': 'Vollbild ein/aus',
  'menu.view.toggleDevTools': 'Dev Tools ein/aus'
}

export default { ...appMenu, ...editMenu, ...viewMenu, ...helpMenu }
