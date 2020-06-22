import React, { useMemo } from 'react'

import Text from 'antd/lib/typography/Text'
import { useObservableState } from 'observable-hooks'
import { palette } from 'styled-theme'

import { ReactComponent as SettingsIcon } from '../../assets/svg/icon-settings.svg'
import { useThemeContext } from '../../contexts/ThemeContext'
import { HeaderIconWrapper } from './HeaderIcon.style'

type Props = {
  onPress?: () => void
  isDesktopView: boolean
  disabled?: boolean
}

const HeaderSettings: React.FC<Props> = (props: Props): JSX.Element => {
  const { onPress = () => {}, isDesktopView, disabled = false } = props
  const { theme$ } = useThemeContext()
  const theme = useObservableState(theme$)
  const color = useMemo(() => palette('text', 0)({ theme }), [theme])
  const iconStyle = { fontSize: '1.5em', cursor: disabled ? 'not-allowed' : 'pointer' }

  const clickHandler = (_: React.MouseEvent) => onPress()

  return (
    <HeaderIconWrapper onClick={clickHandler} disabled={disabled}>
      {!isDesktopView && <Text style={{ color }}>SETTINGS</Text>}
      <SettingsIcon style={{ color, ...iconStyle }} />
    </HeaderIconWrapper>
  )
}

export default HeaderSettings
