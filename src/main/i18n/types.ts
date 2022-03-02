export type AppMenuMessages = {
  'menu.app.about': string
  'menu.app.hideApp': string
  'menu.app.hideOthers': string
  'menu.app.unhide': string
  'menu.app.quit': string
}

export type EditMenuMessages = {
  'menu.edit.title': string
  'menu.edit.undo': string
  'menu.edit.redo': string
  'menu.edit.cut': string
  'menu.edit.copy': string
  'menu.edit.paste': string
  'menu.edit.selectAll': string
}

export type HelpMenuMessages = {
  'menu.help.title': string
  'menu.help.learn': string
  'menu.help.docs': string
  'menu.help.discord': string
  'menu.help.issues': string
}

export type ViewMenuMessages = {
  'menu.view.title': string
  'menu.view.reload': string
  'menu.view.toggleFullscreen': string
  'menu.view.toggleDevTools': string
}

export type Messages = AppMenuMessages & HelpMenuMessages & HelpMenuMessages & ViewMenuMessages
