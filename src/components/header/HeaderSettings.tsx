import React, { useMemo, useCallback } from 'react'

import Text from 'antd/lib/typography/Text'
import { useObservableState } from 'observable-hooks'
import { useHistory } from 'react-router-dom'
import { palette } from 'styled-theme'

import { ReactComponent as SettingsIcon } from '../../assets/svg/icon-settings.svg'
import { useThemeContext } from '../../contexts/ThemeContext'
import * as walletRoutes from '../../routes/wallet'
import { HeaderSettingsWrapper } from './HeaderSettings.style'

type Props = {
  onPress?: () => void
  isDesktopView: boolean
}

const HeaderSettings: React.FC<Props> = (props: Props): JSX.Element => {
  const { onPress = () => {}, isDesktopView } = props
  const { theme$ } = useThemeContext()
  const theme = useObservableState(theme$)
  const color = useMemo(() => palette('text', 0)({ theme }), [theme])
  const iconStyle = { fontSize: '1.5em', marginLeft: '20px' }

  const history = useHistory()
  const clickSettingsHandler = useCallback(() => {
    history.push(walletRoutes.settings.path())
    onPress()
  }, [onPress, history])

  return (
    <HeaderSettingsWrapper onClick={() => clickSettingsHandler()}>
      {!isDesktopView && <Text style={{ color }}>SETTINGS</Text>}
      <SettingsIcon style={{ color, ...iconStyle }} />
    </HeaderSettingsWrapper>
  )
}

export default HeaderSettings
