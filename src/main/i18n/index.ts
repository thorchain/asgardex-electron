import { createIntlCache } from 'react-intl'

import { Locale } from '../../shared/i18n/types'
import de from './de'
import en from './en'
import ru from './ru'
import { Messages } from './types'

export const getMessagesByLocale = (l: Locale): Messages => {
  switch (l) {
    case Locale.EN:
      return en
    case Locale.RU:
      return ru
    case Locale.DE:
      return de
    default:
      return en
  }
}

export const cache = createIntlCache()
