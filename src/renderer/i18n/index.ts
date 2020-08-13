import de from './de'
import en from './en'
import fr from './fr'
import ru from './ru'
import { Locale, Messages } from './types'

export const LOCALES = [Locale.EN, Locale.DE, Locale.FR, Locale.RU]

export const getLocaleFromString = (s: string): Locale => {
  switch (s) {
    case 'en':
      return Locale.EN
    case 'fr':
      return Locale.FR
    case 'de':
      return Locale.DE
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
    case Locale.FR:
      return fr
    case Locale.DE:
      return de
    case Locale.RU:
      return ru
    default:
      return en
  }
}
