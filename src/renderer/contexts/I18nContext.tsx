import React, { createContext, useContext, useMemo } from 'react'

import { ConfigProvider } from 'antd'
import deDE from 'antd/lib/locale/de_DE'
import enUS from 'antd/lib/locale/en_US'
import frFR from 'antd/lib/locale/fr_FR'
import ruRU from 'antd/lib/locale/ru_RU'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import { IntlProvider } from 'react-intl'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { DEFAULT_LOCALE } from '../../shared/i18n/const'
import { Locale } from '../../shared/i18n/types'
import { getMessagesByLocale } from '../i18n'
import { common } from '../services/storage'

const { getStorageState$, modifyStorage } = common

type I18nContextValue = {
  locale$: Rx.Observable<Locale>
  changeLocale: (l: Locale) => void
}

export const locale$ = FP.pipe(
  getStorageState$,
  RxOp.map(
    FP.flow(
      O.map(({ locale }) => locale),
      O.getOrElse(() => DEFAULT_LOCALE)
    )
  ),
  RxOp.distinctUntilChanged()
)

export const changeLocale = (locale: Locale) => {
  modifyStorage(O.some({ locale }))
}

export const initialContext: I18nContextValue = {
  locale$,
  changeLocale
}

const I18nContext = createContext<I18nContextValue | null>(null)

const getAntdLocale = (locale: Locale) => {
  switch (locale) {
    case Locale.DE:
      return deDE
    case Locale.FR:
      return frFR
    case Locale.RU:
      return ruRU
    default:
      return enUS
  }
}

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }): JSX.Element => {
  const locale = useObservableState(locale$, DEFAULT_LOCALE)
  const messages = useMemo(() => getMessagesByLocale(locale), [locale])
  const antdLocale = getAntdLocale(locale)
  return (
    <I18nContext.Provider value={initialContext}>
      <IntlProvider locale={locale} messages={messages} defaultLocale={Locale.EN}>
        <ConfigProvider locale={antdLocale}>{children}</ConfigProvider>
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
