import React, { createContext, useContext } from 'react'

import t, { ThemeType, Theme } from '@thorchain/asgardex-theme'
import { useObservableState } from 'observable-hooks'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import * as SC from 'styled-components'

import 'antd/dist/antd.dark.css'
import 'antd/dist/antd.css'
import { observableState } from '../helpers/stateHelper'

const THEME_TYPE = 'asgdx-theme'

export const themes: typeof t = {
  ...t,
  dark: {
    ...t.dark,
    // extend background colors - needed for bg of table rows
    palette: { ...t.dark.palette, background: [...t.dark.palette.background, '#252c33'] }
  },
  light: {
    ...t.light,
    // extend background colors - needed for bg of table rows
    palette: { ...t.light.palette, background: [...t.light.palette.background, '#ededed'] }
  }
}

const initialTheme = (): ThemeType => (localStorage.getItem(THEME_TYPE) as ThemeType) || ThemeType.LIGHT

const { get: themeType, get$: themeType$, set: setThemeType } = observableState<ThemeType>(initialTheme())

const toggleTheme = () => {
  const nextTheme = themeType() === ThemeType.DARK ? ThemeType.LIGHT : ThemeType.DARK
  localStorage.setItem(THEME_TYPE, nextTheme)
  setThemeType(nextTheme)
}

const theme$: Observable<Theme> = themeType$.pipe(
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
  themeType$,
  toggleTheme
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

type Props = {
  theme?: Theme // needed for storybook only
  children: React.ReactNode
}

export const ThemeProvider: React.FC<Props> = ({ children, theme }): JSX.Element => {
  const themeFromObservable = useObservableState(theme$)
  const selectedTheme = theme || themeFromObservable
  return (
    <ThemeContext.Provider value={initialContext}>
      <SC.ThemeProvider theme={{ ...selectedTheme }}>{children}</SC.ThemeProvider>
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
