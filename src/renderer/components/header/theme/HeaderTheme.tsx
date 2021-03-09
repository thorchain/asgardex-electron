import React, { useCallback, useMemo } from 'react'

import { useObservableState } from 'observable-hooks'
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
  const color = useMemo(() => palette('text', 0)({ theme }), [theme])
  const iconStyle = { fontSize: '1.5em' }

  const clickSwitchThemeHandler = useCallback(() => {
    toggleTheme()
    onPress()
  }, [toggleTheme, onPress])

  return (
    <Styled.HeaderThemeWrapper onClick={() => clickSwitchThemeHandler()}>
      {!isDesktopView && (palette('background', 0)({ theme }) === '#fff' ? 'DAY MODE' : 'NIGHT MODE')}
      <Styled.ThemeIcon style={{ color, ...iconStyle }} />
    </Styled.HeaderThemeWrapper>
  )
}
