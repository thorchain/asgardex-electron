import { Locale } from './types'

export const getLocaleFromString = (s: string): Locale => {
  switch (s) {
    case 'en':
      return Locale.EN
    case 'fr':
      return Locale.FR
    case 'de':
      return Locale.DE
    default:
      return Locale.EN
  }
}
