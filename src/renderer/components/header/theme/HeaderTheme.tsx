import React, { useCallback } from 'react'

import { ThemeType } from '@thorchain/asgardex-theme'
import { useObservableState } from 'observable-hooks'
import * as RxOp from 'rxjs/operators'

import { useThemeContext } from '../../../contexts/ThemeContext'
import * as Styled from './HeaderTheme.style'

type Props = {
  onPress?: () => void
  isDesktopView: boolean
}

export const HeaderTheme: React.FC<Props> = (props): JSX.Element => {
  const { onPress = () => {}, isDesktopView } = props
  const { toggleTheme, themeType$ } = useThemeContext()

  const [isLightTheme] = useObservableState(() => themeType$.pipe(RxOp.map((type) => type === ThemeType.LIGHT)), false)

  const clickSwitchThemeHandler = useCallback(() => {
    toggleTheme()
    onPress()
  }, [toggleTheme, onPress])

  return (
    <Styled.HeaderThemeWrapper onClick={() => clickSwitchThemeHandler()}>
      {!isDesktopView && (isLightTheme ? 'DAY MODE' : 'NIGHT MODE')}
      {isLightTheme ? <Styled.DayThemeIcon /> : <Styled.NightThemeIcon />}
    </Styled.HeaderThemeWrapper>
  )
}
