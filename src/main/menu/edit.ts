import { MenuItemConstructorOptions } from 'electron'
import { IntlShape } from 'react-intl'

const menu = (intl: IntlShape): MenuItemConstructorOptions => ({
  label: intl.formatMessage({ id: 'menu.edit.title' }),
  submenu: [
    {
      label: intl.formatMessage({ id: 'menu.edit.undo' }),
      role: 'undo'
    },
    {
      label: intl.formatMessage({ id: 'menu.edit.redo' }),
      role: 'redo'
    },
    {
      type: 'separator'
    },
    {
      label: intl.formatMessage({ id: 'menu.edit.cut' }),
      role: 'cut'
    },
    {
      label: intl.formatMessage({ id: 'menu.edit.copy' }),
      role: 'copy'
    },
    {
      label: intl.formatMessage({ id: 'menu.edit.paste' }),
      role: 'paste'
    },
    {
      label: intl.formatMessage({ id: 'menu.edit.selectAll' }),
      role: 'selectAll'
    }
  ]
})

export default menu
