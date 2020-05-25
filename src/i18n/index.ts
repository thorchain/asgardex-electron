import en from './en'
import fr from './fr'
import { Locale, Messages } from './types'

export const LOCALES = [Locale.EN, Locale.FR]

export const getLocaleFromString = (s: string): Locale => {
  switch (s) {
    case 'en':
      return Locale.EN
    case 'fr':
      return Locale.FR
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
    default:
      return en
  }
}
