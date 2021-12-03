import { Locale } from '../../shared/i18n/types'
import de from './de'
import en from './en'
import fr from './fr'
import ru from './ru'
import { Messages } from './types'

// RU is disabled temporary - some help from community is needed - see https://github.com/thorchain/asgardex-electron/issues/1966
export const LOCALES = [Locale.EN, Locale.DE, Locale.FR /* Locale.RU */]

export const getLocaleFromString = (s: string): Locale => {
  switch (s) {
    case 'en':
      return Locale.EN
    case 'de':
      return Locale.DE
    case 'fr':
      return Locale.FR
    case 'ru':
      return Locale.RU
    default:
      return Locale.EN
  }
}

export const getMessagesByLocale = (l: Locale): Messages => {
  switch (l) {
    case Locale.EN:
      return en
    case Locale.DE:
      return de
    case Locale.FR:
      return fr
    case Locale.RU:
      return ru
    default:
      return en
  }
}
