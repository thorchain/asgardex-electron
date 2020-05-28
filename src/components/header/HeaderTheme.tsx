import React, { useMemo } from 'react'

import { Grid } from 'antd'
import { useObservableState } from 'observable-hooks'
import { palette } from 'styled-theme'

import { ReactComponent as ThemeIcon } from '../../assets/svg/icon-theme-switch.svg'
import { useThemeContext } from '../../contexts/ThemeContext'
import { HeaderThemeWrapper } from './HeaderTheme.style'

type Props = {
  onPress?: () => void
}

const HeaderTheme: React.FC<Props> = (props: Props): JSX.Element => {
  const { onPress = () => {} } = props
  const { toggleTheme, theme$ } = useThemeContext()
  const theme = useObservableState(theme$)
  const color = useMemo(() => palette('text', 0)({ theme }), [theme])
  const iconStyle = { fontSize: '1.5em', marginLeft: '20px' }
  const isDesktopView = Grid.useBreakpoint().lg

  const clickSwitchThemeHandler = () => {
    toggleTheme()
    onPress()
  }

  return (
    <HeaderThemeWrapper onClick={() => clickSwitchThemeHandler()}>
      {!isDesktopView && (palette('background', 0)({ theme }) === '#fff' ? 'DAY MODE' : 'NIGHT MODE')}
      <ThemeIcon style={{ color, ...iconStyle }} />
    </HeaderThemeWrapper>
  )
}

export default HeaderTheme
