import { MenuItemConstructorOptions } from 'electron'
import { IntlShape } from 'react-intl'

import packageInfo from '../../../package.json'
import { ExternalUrl } from '../../shared/const'
import { apiUrl } from '../api/url'

const menu = (intl: IntlShape): MenuItemConstructorOptions => ({
  label: intl.formatMessage({ id: 'menu.help.title' }),
  submenu: [
    {
      label: intl.formatMessage({ id: 'menu.help.learn' }),
      click() {
        apiUrl.openExternal(ExternalUrl.WEBSITE)
      }
    },
    {
      label: intl.formatMessage({ id: 'menu.help.docs' }),
      click() {
        apiUrl.openExternal(ExternalUrl.DOCS)
      }
    },
    {
      label: intl.formatMessage({ id: 'menu.help.telegram' }),
      click() {
        apiUrl.openExternal(ExternalUrl.TELEGRAM)
      }
    },
    {
      label: intl.formatMessage({ id: 'menu.help.issues' }),
      click() {
        apiUrl.openExternal(`${packageInfo.bugs.url}`)
      }
    }
  ]
})

export default menu
