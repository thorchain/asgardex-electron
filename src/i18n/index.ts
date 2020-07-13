import de from './de'
import en from './en'
import fr from './fr'
import { Locale, Messages } from './types'

export const LOCALES = [Locale.EN, Locale.DE, Locale.FR]

export const getMessagesByLocale = (l: Locale): Messages => {
  switch (l) {
    case Locale.EN:
      return en
    case Locale.FR:
      return fr
    case Locale.DE:
      return de
    default:
      return en
  }
}
