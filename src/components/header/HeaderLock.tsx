import React, { useMemo } from 'react'

import { useObservableState } from 'observable-hooks'
import { palette } from 'styled-theme'

import { ReactComponent as SettingsIcon } from '../../assets/svg/icon-lock.svg'
import { useThemeContext } from '../../contexts/ThemeContext'
import { HeaderLockWrapper } from './HeaderLock.style'

type Props = {
  onPress?: () => void
  isDesktopView: boolean
}

const HeaderLock: React.FC<Props> = (props: Props): JSX.Element => {
  const { onPress = () => {}, isDesktopView } = props
  const { theme$ } = useThemeContext()
  const theme = useObservableState(theme$)
  const color = useMemo(() => palette('text', 0)({ theme }), [theme])
  const iconStyle = { fontSize: '1.5em', marginLeft: '20px' }

  const clickHandler = (_: React.MouseEvent) => onPress()

  return (
    <HeaderLockWrapper onClick={clickHandler}>
      {!isDesktopView && 'LOCK WALLET'}
      <SettingsIcon style={{ color, ...iconStyle }} />
    </HeaderLockWrapper>
  )
}

export default HeaderLock
