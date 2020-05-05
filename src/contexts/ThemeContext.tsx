import React, { createContext, useContext } from 'react'
import * as SC from 'styled-components'
import { BehaviorSubject, Observable } from 'rxjs'
import { Theme } from '../themes/types'
import { theme as darkTheme } from '../themes/dark'
import { theme as lightTheme } from '../themes/light'
import { map } from 'rxjs/operators'
import { useObservableState } from 'observable-hooks'

import 'antd/dist/antd.dark.css'
import 'antd/dist/antd.css'

export enum ThemeType {
  DARK = 'DARK_THEME',
  LIGHT = 'LIGHT_THEME'
}

const THEME_TYPE = 'THEME_TYPE'

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
    if (type === ThemeType.LIGHT) return lightTheme
    else return darkTheme
  })
)

type ThemeContextValue = {
  theme$: Observable<Theme>
  themeType$: Observable<ThemeType>
  toggleTheme: () => void
}

const initialContext: ThemeContextValue = {
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
      <SC.ThemeProvider theme={{ theme }}>{children}</SC.ThemeProvider>
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
