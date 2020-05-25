import React, { createContext, useContext, useMemo } from 'react'

import { useObservableState } from 'observable-hooks'
import { IntlProvider } from 'react-intl'
import * as Rx from 'rxjs'

import { getLocaleFromString, getMessagesByLocale } from '../i18n'
import { Locale } from '../i18n/types'

const LOCALE_KEY = 'asgdx-locale'

const initialLocale = (): Locale => {
  const lang = navigator.language.split(/[-_]/)[0]
  return (localStorage.getItem(LOCALE_KEY) as Locale) || getLocaleFromString(lang)
}

const selectedLocale$$ = new Rx.BehaviorSubject(initialLocale())
const locale$ = selectedLocale$$.asObservable()

const changeLocale = (nextLocale: Locale) => {
  localStorage.setItem(LOCALE_KEY, nextLocale)
  selectedLocale$$.next(nextLocale)
}

type I18nContextValue = {
  locale$: Rx.Observable<Locale>
  changeLocale: (l: Locale) => void
}

export const initialContext: I18nContextValue = {
  locale$,
  changeLocale
}

const I18nContext = createContext<I18nContextValue | null>(null)

type Props = {
  children: React.ReactNode
}

export const I18nProvider: React.FC<Props> = ({ children }: Props): JSX.Element => {
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
