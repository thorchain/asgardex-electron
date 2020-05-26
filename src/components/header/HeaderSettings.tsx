import React, { useMemo, useCallback } from 'react'
import { palette } from 'styled-theme'
import { useObservableState } from 'observable-hooks'
import { useHistory } from 'react-router-dom'
import { useThemeContext } from '../../contexts/ThemeContext'
import { HeaderSettingsWrapper } from './HeaderSettings.style'
import * as walletRoutes from '../../routes/wallet'
import { ReactComponent as SettingsIcon } from '../../assets/svg/icon-settings.svg'
import { MobileWrapper } from './Header.style'

type Props = {
  onPress?: () => void
}

const HeaderSettings: React.FC<Props> = (_: Props): JSX.Element => {
  const { theme$ } = useThemeContext()
  const theme = useObservableState(theme$)

  const color = useMemo(() => palette('text', 0)({ theme }), [theme])
  const iconStyle = { fontSize: '1.5em', marginLeft: '20px' }

  const history = useHistory()
  const clickSettingsHandler = useCallback(() => {
    history.push(walletRoutes.settings.path())
    _.onPress && _.onPress()
  }, [_, history])

  return (
    <HeaderSettingsWrapper onClick={() => clickSettingsHandler()}>
      <MobileWrapper>SETTINGS</MobileWrapper>
      <SettingsIcon style={{ color, ...iconStyle }} />
    </HeaderSettingsWrapper>
  )
}

export default HeaderSettings
