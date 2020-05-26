import React, { useMemo, useCallback } from 'react'
import { palette } from 'styled-theme'
import { useObservableState } from 'observable-hooks'
import { useThemeContext } from '../../contexts/ThemeContext'
import { HeaderLockWrapper } from './HeaderLock.style'
import { ReactComponent as SettingsIcon } from '../../assets/svg/icon-lock.svg'
import { MobileWrapper } from './Header.style'

type Props = {
  onPress?: () => void
}

const HeaderLock: React.FC<Props> = (_: Props): JSX.Element => {
  const { theme$ } = useThemeContext()
  const theme = useObservableState(theme$)

  const color = useMemo(() => palette('text', 0)({ theme }), [theme])
  const iconStyle = { fontSize: '1.5em', marginLeft: '20px' }

  const clickHandler = useCallback(() => {
    // has to be implemented
    _.onPress && _.onPress()
  }, [_])

  return (
    <HeaderLockWrapper onClick={() => clickHandler()}>
      <MobileWrapper>LOCK WALLET</MobileWrapper>
      <SettingsIcon style={{ color, ...iconStyle }} />
    </HeaderLockWrapper>
  )
}

export default HeaderLock
