import { MenuItemConstructorOptions } from 'electron'
import { IntlShape } from 'react-intl'

const defaultSubMenu = (intl: IntlShape): MenuItemConstructorOptions[] => [
  {
    label: intl.formatMessage({ id: 'menu.view.toggleFullscreen' }),
    role: 'togglefullscreen'
  }
]

const devSubMenu = (intl: IntlShape): MenuItemConstructorOptions[] => [
  {
    label: intl.formatMessage({ id: 'menu.view.reload' }),
    role: 'reload'
  },
  {
    label: intl.formatMessage({ id: 'menu.view.toggleDevTools' }),
    role: 'toggleDevTools'
  }
]

const menu = (intl: IntlShape, isDev: boolean): MenuItemConstructorOptions => ({
  label: intl.formatMessage({ id: 'menu.view.title' }),
  submenu: isDev ? [...defaultSubMenu(intl), ...devSubMenu(intl)] : defaultSubMenu(intl)
})

export default menu
