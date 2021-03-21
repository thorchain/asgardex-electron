import React, { useCallback } from 'react'

import { useObservableState } from 'observable-hooks'
import { Moon, Sun } from 'react-feather'
import { palette } from 'styled-theme'

import { useThemeContext } from '../../../contexts/ThemeContext'
import * as Styled from './HeaderTheme.style'

type Props = {
  onPress?: () => void
  isDesktopView: boolean
}

export const HeaderTheme: React.FC<Props> = (props): JSX.Element => {
  const { onPress = () => {}, isDesktopView } = props
  const { toggleTheme, theme$ } = useThemeContext()
  const theme = useObservableState(theme$)
  const isDay = palette('background', 0)({ theme }) === '#fff'

  const clickSwitchThemeHandler = useCallback(() => {
    toggleTheme()
    onPress()
  }, [toggleTheme, onPress])

  return (
    <Styled.HeaderThemeWrapper onClick={() => clickSwitchThemeHandler()}>
      {!isDesktopView && (isDay ? 'DAY MODE' : 'NIGHT MODE')}
      {isDay ? <Sun /> : <Moon color="white" />}
    </Styled.HeaderThemeWrapper>
  )
}
