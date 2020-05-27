import React, { useMemo, useCallback } from 'react'
import { palette } from 'styled-theme'
import { useObservableState } from 'observable-hooks'
import { useHistory } from 'react-router-dom'
import { useThemeContext } from '../../contexts/ThemeContext'
import { HeaderSettingsWrapper } from './HeaderSettings.style'
import * as walletRoutes from '../../routes/wallet'
import { ReactComponent as SettingsIcon } from '../../assets/svg/icon-settings.svg'
import { Grid } from 'antd'

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

  const history = useHistory()
  const clickSettingsHandler = useCallback(() => {
    history.push(walletRoutes.settings.path())
    onPress()
  }, [onPress, history])

  return (
    <HeaderSettingsWrapper onClick={() => clickSettingsHandler()}>
      {!isDesktopView && 'SETTINGS'}
      <SettingsIcon style={{ color, ...iconStyle }} />
    </HeaderSettingsWrapper>
  )
}

export default HeaderSettings
