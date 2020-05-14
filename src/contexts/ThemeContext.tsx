import React, { createContext, useContext } from 'react'
import * as SC from 'styled-components'
import { BehaviorSubject, Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { useObservableState } from 'observable-hooks'
import themes, { ThemeType, Theme } from '@thorchain/asgardex-theme'

import 'antd/dist/antd.dark.css'
import 'antd/dist/antd.css'

const THEME_TYPE = 'asgdx-theme'

const initialTheme = (): ThemeType => (localStorage.getItem(THEME_TYPE) as ThemeType) || ThemeType.LIGHT

const selectedTheme$$ = new BehaviorSubject(initialTheme())
const toggleTheme = () => {
  const currentTheme = selectedTheme$$.getValue()
  const nextTheme = currentTheme === ThemeType.DARK ? ThemeType.LIGHT : ThemeType.DARK
  localStorage.setItem(THEME_TYPE, nextTheme)
  selectedTheme$$.next(nextTheme)
}

const theme$ = selectedTheme$$.pipe(
  map((type) => {
    if (type === ThemeType.LIGHT) return themes.light
    else return themes.dark
  })
)

type ThemeContextValue = {
  theme$: Observable<Theme>
  themeType$: Observable<ThemeType>
  toggleTheme: () => void
}

export const initialContext: ThemeContextValue = {
  theme$,
  themeType$: selectedTheme$$.asObservable(),
  toggleTheme
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

type Props = {
  children: React.ReactNode
}

export const ThemeProvider: React.FC<Props> = ({ children }: Props): JSX.Element => {
  const theme = useObservableState(theme$)
  return (
    <ThemeContext.Provider value={initialContext}>
      <SC.ThemeProvider theme={{ ...theme }}>{children}</SC.ThemeProvider>
    </ThemeContext.Provider>
  )
}

export const useThemeContext = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('Context must be used within a ThemeProvider.')
  }
  return context
}
