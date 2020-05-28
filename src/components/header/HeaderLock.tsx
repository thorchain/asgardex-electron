import React, { useMemo, useCallback } from 'react'

import { Grid } from 'antd'
import { useObservableState } from 'observable-hooks'
import { palette } from 'styled-theme'

import { ReactComponent as SettingsIcon } from '../../assets/svg/icon-lock.svg'
import { useThemeContext } from '../../contexts/ThemeContext'
import { HeaderLockWrapper } from './HeaderLock.style'

type Props = {
  onPress?: () => void
}

const HeaderLock: React.FC<Props> = (props: Props): JSX.Element => {
  const { onPress = () => {} } = props
  const { theme$ } = useThemeContext()
  const theme = useObservableState(theme$)
  const color = useMemo(() => palette('text', 0)({ theme }), [theme])
  const iconStyle = { fontSize: '1.5em', marginLeft: '20px' }
  const isDesktopView = Grid.useBreakpoint().lg

  const clickHandler = useCallback(() => {
    // has to be implemented
    onPress()
  }, [onPress])

  return (
    <HeaderLockWrapper onClick={() => clickHandler()}>
      {!isDesktopView && 'LOCK WALLET'}
      <SettingsIcon style={{ color, ...iconStyle }} />
    </HeaderLockWrapper>
  )
}

export default HeaderLock
