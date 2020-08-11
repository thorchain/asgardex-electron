import { observableState } from '../../helpers/stateHelper'
import { getLocaleFromString } from '../../i18n'
import { Locale } from '../../i18n/types'

const LOCALE_KEY = 'asgdx-locale'

const defaultLocale = () => {
  const lang = navigator.language.split(/[-_]/)[0]
  return getLocaleFromString(lang)
}

export const initialLocale = (): Locale => {
  const locale = (localStorage?.getItem(LOCALE_KEY) as Locale) || defaultLocale()
  window.apiLang.update(locale)
  return locale
}

/**
 * Observable state of `Locale`
 */
const { get$: locale$, get: locale, set: setLocale } = observableState<Locale>(initialLocale())

const changeLocale = (next: Locale) => {
  if (next !== locale()) {
    localStorage.setItem(LOCALE_KEY, next)
    window.apiLang.update(next)
    setLocale(next)
  }
}

export { changeLocale, locale$ }
