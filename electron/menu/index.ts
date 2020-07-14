import { Menu } from 'electron'
import { createIntl } from 'react-intl'

import { getLocaleFromString } from '../../src/shared/i18n'
import { getMessagesByLocale, cache } from '../i18n'
import appMenu from './app'
import editMenu from './edit'
import helpMenu from './help'
import viewMenu from './view'

export const setMenu = (localeStr: string, isDev: boolean) => {
  const locale = getLocaleFromString(localeStr)
  const intl = createIntl({ locale, messages: getMessagesByLocale(locale) }, cache)
  const defaultTemplate = [editMenu(intl), viewMenu(intl, isDev), helpMenu(intl)]
  const template = process.platform === 'darwin' ? [appMenu(intl), ...defaultTemplate] : defaultTemplate
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}
