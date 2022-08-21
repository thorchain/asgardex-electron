import { EditMenuMessages, HelpMenuMessages, ViewMenuMessages, AppMenuMessages } from '../types'

const appMenu: AppMenuMessages = {
  'menu.app.about': 'О {name}',
  'menu.app.hideApp': 'Скрыть {name}',
  'menu.app.hideOthers': 'Скрыть остальные',
  'menu.app.unhide': 'Показать все',
  'menu.app.quit': 'Выйти {name}'
}

const editMenu: EditMenuMessages = {
  'menu.edit.title': 'Править',
  'menu.edit.undo': 'Отменить',
  'menu.edit.redo': 'Повторить',
  'menu.edit.cut': 'Вырезать',
  'menu.edit.copy': 'Копировать',
  'menu.edit.paste': 'Вставить',
  'menu.edit.selectAll': 'Выбрать все'
}

const helpMenu: HelpMenuMessages = {
  'menu.help.title': 'Помощь',
  'menu.help.learn': 'Узнать больше...',
  'menu.help.docs': 'Документация',
  'menu.help.discord': 'Discord',
  'menu.help.issues': 'Проблемы'
}

const viewMenu: ViewMenuMessages = {
  'menu.view.title': ' Вид',
  'menu.view.reload': 'Обновить',
  'menu.view.toggleFullscreen': 'Переключить полноэеранные режим',
  'menu.view.toggleDevTools': 'Открыть/Скрыть инструменты разработчика'
}

export default { ...appMenu, ...editMenu, ...viewMenu, ...helpMenu }
