import React, { createContext, useContext, useMemo } from 'react'

import { useObservableState } from 'observable-hooks'
import { IntlProvider } from 'react-intl'
import * as Rx from 'rxjs'

import { getMessagesByLocale } from '../i18n'
import { Locale } from '../i18n/types'
import { locale$, changeLocale, initialLocale } from '../services/i18n/service'

type I18nContextValue = {
  locale$: Rx.Observable<Locale>
  changeLocale: (l: Locale) => void
}

export const initialContext: I18nContextValue = {
  locale$,
  changeLocale
}

const I18nContext = createContext<I18nContextValue | null>(null)

export const I18nProvider: React.FC = ({ children }): JSX.Element => {
  const locale = useObservableState(locale$, initialLocale())
  const messages = useMemo(() => getMessagesByLocale(locale), [locale])
  return (
    <I18nContext.Provider value={initialContext}>
      <IntlProvider locale={locale} messages={messages} defaultLocale={Locale.EN}>
        {children}
      </IntlProvider>
    </I18nContext.Provider>
  )
}

export const useI18nContext = () => {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('Context must be used within a I18nProvider.')
  }
  return context
}
