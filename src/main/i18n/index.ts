import { createIntlCache } from 'react-intl'

import { Locale } from '../../shared/i18n/types'
import de from './de'
import en from './en'
import fr from './fr'
import { Messages } from './types'

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

export const cache = createIntlCache()
