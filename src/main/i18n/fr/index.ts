import { EditMenuMessages, HelpMenuMessages, ViewMenuMessages, AppMenuMessages } from '../types'

const appMenu: AppMenuMessages = {
  'menu.app.about': 'À propos de {name}',
  'menu.app.hideApp': 'Masquer {name}',
  'menu.app.hideOthers': 'Masquer les autres',
  'menu.app.unhide': 'Montrer tout',
  'menu.app.quit': 'Quitter {name}'
}

const editMenu: EditMenuMessages = {
  'menu.edit.title': 'Edition',
  'menu.edit.undo': 'Annuler',
  'menu.edit.redo': 'Rétablir',
  'menu.edit.cut': 'Couper',
  'menu.edit.copy': 'Copier',
  'menu.edit.paste': 'Coller',
  'menu.edit.selectAll': 'Sélectionner tout'
}

const helpMenu: HelpMenuMessages = {
  'menu.help.title': 'Aide',
  'menu.help.learn': 'En apprendre davantage...',
  'menu.help.docs': 'Documentation',
  'menu.help.discord': 'Discord',
  'menu.help.issues': 'Signaler un problème'
}

const viewMenu: ViewMenuMessages = {
  'menu.view.title': 'Affichage',
  'menu.view.reload': 'Recharger',
  'menu.view.toggleFullscreen': 'Basculer en plein écran',
  'menu.view.toggleDevTools': 'Basculer en outils de développement'
}

export default { ...appMenu, ...editMenu, ...viewMenu, ...helpMenu }
