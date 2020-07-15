import { MenuItemConstructorOptions, app } from 'electron'
import { IntlShape } from 'react-intl'

const menu = (intl: IntlShape): MenuItemConstructorOptions => {
  const name = app.getName()

  return {
    label: name,
    submenu: [
      {
        label: intl.formatMessage({ id: 'menu.app.about' }, { name }),
        role: 'about'
      },
      { type: 'separator' },
      {
        label: intl.formatMessage({ id: 'menu.app.hideApp' }, { name }),
        role: 'hide'
      },
      {
        label: intl.formatMessage({ id: 'menu.app.hideOthers' }),
        role: 'hideOthers'
      },
      {
        label: intl.formatMessage({ id: 'menu.app.unhide' }),
        role: 'unhide'
      },
      { type: 'separator' },
      {
        label: intl.formatMessage({ id: 'menu.app.quit' }, { name }),
        role: 'quit'
      }
    ]
  }
}

export default menu
