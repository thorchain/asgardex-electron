import { MenuItemConstructorOptions } from 'electron'
import { IntlShape } from 'react-intl'

import { ExternalUrl } from '../../shared/const'
import { openExternal } from '../api/url'

const menu = (intl: IntlShape): MenuItemConstructorOptions => ({
  label: intl.formatMessage({ id: 'menu.help.title' }),
  submenu: [
    {
      label: intl.formatMessage({ id: 'menu.help.learn' }),
      click() {
        openExternal(ExternalUrl.DOCS)
      }
    },
    {
      label: intl.formatMessage({ id: 'menu.help.discord' }),
      click() {
        openExternal(ExternalUrl.DISCORD)
      }
    },
    {
      label: intl.formatMessage({ id: 'menu.help.issues' }),
      click() {
        openExternal(`${ExternalUrl.GITHUB_REPO}/issues`)
      }
    }
  ]
})

export default menu
