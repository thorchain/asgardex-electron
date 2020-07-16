import { ipcRenderer } from 'electron'

import IPCMessages from '../../../shared/ipc/messages'
import { observableState } from '../../helpers/stateHelper'
import { getLocaleFromString } from '../../i18n'
import { Locale } from '../../i18n/types'

const LOCALE_KEY = 'asgdx-locale'

const defaultLocale = () => {
  const lang = navigator.language.split(/[-_]/)[0]
  getLocaleFromString(lang)
}

export const initialLocale = (): Locale => {
  const locale = (localStorage?.getItem(LOCALE_KEY) as Locale) || defaultLocale()
  ipcRenderer.send(IPCMessages.UPDATE_LANG, locale)
  return locale
}

/**
 * Observable state of `Locale`
 */
const { get$: locale$, get: locale, set: setLocale } = observableState<Locale>(initialLocale())

const changeLocale = (next: Locale) => {
  if (next !== locale()) {
    localStorage.setItem(LOCALE_KEY, next)
    ipcRenderer.send(IPCMessages.UPDATE_LANG, next)
    setLocale(next)
  }
}

export { changeLocale, locale$ }
