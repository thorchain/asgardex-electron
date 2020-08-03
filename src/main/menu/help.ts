import { MenuItemConstructorOptions, shell } from 'electron'
import { IntlShape } from 'react-intl'

import { ExternalUrl } from '../../shared/const'

const menu = (intl: IntlShape): MenuItemConstructorOptions => ({
  label: intl.formatMessage({ id: 'menu.help.title' }),
  submenu: [
    {
      label: intl.formatMessage({ id: 'menu.help.learn' }),
      click() {
        shell.openExternal(ExternalUrl.WEBSITE)
      }
    },
    {
      label: intl.formatMessage({ id: 'menu.help.docs' }),
      click() {
        shell.openExternal(ExternalUrl.DOCS)
      }
    },
    {
      label: intl.formatMessage({ id: 'menu.help.telegram' }),
      click() {
        shell.openExternal(ExternalUrl.TELEGRAM)
      }
    },
    {
      label: intl.formatMessage({ id: 'menu.help.issues' }),
      click() {
        shell.openExternal(`${ExternalUrl.GITHUB_REPO}/issues`)
      }
    }
  ]
})

export default menu
