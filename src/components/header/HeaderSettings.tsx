import React, { useMemo } from 'react'

import { Grid } from 'antd'
import { useObservableState } from 'observable-hooks'
import { palette } from 'styled-theme'

import { ReactComponent as SettingsIcon } from '../../assets/svg/icon-settings.svg'
import { useThemeContext } from '../../contexts/ThemeContext'
import { HeaderSettingsWrapper } from './HeaderSettings.style'

type Props = {
  onPress?: () => void
}

const HeaderSettings: React.FC<Props> = (props: Props): JSX.Element => {
  const { onPress = () => {} } = props
  const { theme$ } = useThemeContext()
  const theme = useObservableState(theme$)
  const color = useMemo(() => palette('text', 0)({ theme }), [theme])
  const iconStyle = { fontSize: '1.5em', marginLeft: '20px' }
  const isDesktopView = Grid.useBreakpoint().lg

  const clickHandler = (_: React.MouseEvent) => onPress()

  return (
    <HeaderSettingsWrapper onClick={clickHandler}>
      {!isDesktopView && 'SETTINGS'}
      <SettingsIcon style={{ color, ...iconStyle }} />
    </HeaderSettingsWrapper>
  )
}

export default HeaderSettings
