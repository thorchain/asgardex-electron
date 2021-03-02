import React, { createContext, useContext, useMemo } from 'react'

import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import { IntlProvider } from 'react-intl'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { STORE_FILES_DEFAULTS } from '../../shared/const'
import { Locale } from '../../shared/i18n/types'
import { getMessagesByLocale } from '../i18n'
import { common } from '../services/storage'

const { getStorageState$, modifyStorage } = common

type I18nContextValue = {
  locale$: Rx.Observable<Locale>
  changeLocale: (l: Locale) => void
  initialLocale: () => Locale
}

export const initialLocale = (): Locale => STORE_FILES_DEFAULTS.commonStorage.locale

export const locale$ = FP.pipe(
  getStorageState$,
  RxOp.map(
    FP.flow(
      O.map(({ locale }) => locale),
      O.getOrElse(initialLocale)
    )
  ),
  RxOp.distinctUntilChanged()
)

export const changeLocale = (locale: Locale) => {
  modifyStorage(O.some({ locale }))
}

export const initialContext: I18nContextValue = {
  locale$,
  changeLocale,
  initialLocale
}

const I18nContext = createContext<I18nContextValue | null>(null)

export const I18nProvider: React.FC = ({ children }): JSX.Element => {
  const locale = useObservableState(locale$, initialLocale)
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
