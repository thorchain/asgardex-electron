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
}

const HeaderSettings: React.FC<Props> = (props): JSX.Element => {
  const { onPress = () => {}, isDesktopView } = props
  const { theme$ } = useThemeContext()
  const theme = useObservableState(theme$)
  const color = useMemo(() => palette('text', 0)({ theme }), [theme])
  const iconStyle = useMemo(() => ({ fontSize: '1.5em' }), [])

  return (
    <HeaderIconWrapper onClick={onPress}>
      {!isDesktopView && <Text style={{ color }}>SETTINGS</Text>}
      <SettingsIcon style={{ color, ...iconStyle }} />
    </HeaderIconWrapper>
  )
}

export default HeaderSettings
