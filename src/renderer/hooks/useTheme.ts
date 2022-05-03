import type { Theme } from '@thorchain/asgardex-theme'
import themes, { ThemeType } from '@thorchain/asgardex-theme'
import * as FP from 'fp-ts/lib/function'
import { useObservableState } from 'observable-hooks'
import * as RxOp from 'rxjs/operators'

import { useThemeContext } from '../contexts/ThemeContext'

export const useTheme = (): { isLight: boolean; theme: Theme; toggle: FP.Lazy<void> } => {
  const { themeType$, toggleTheme: toggle } = useThemeContext()

  const [{ isLight, theme }] = useObservableState(
    () =>
      themeType$.pipe(
        RxOp.map((type) => {
          const isLight = type === ThemeType.LIGHT
          return { isLight, theme: isLight ? themes.light : themes.dark }
        })
      ),
    { isLight: false, theme: themes.dark }
  )

  return { isLight, theme, toggle }
}
