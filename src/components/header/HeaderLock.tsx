import React, { useMemo } from 'react'

import Text from 'antd/lib/typography/Text'
import { useObservableState } from 'observable-hooks'
import { palette } from 'styled-theme'

import { ReactComponent as LockIcon } from '../../assets/svg/icon-lock.svg'
import { ReactComponent as UnlockIcon } from '../../assets/svg/icon-unlock.svg'
import { useThemeContext } from '../../contexts/ThemeContext'
import { HeaderLockWrapper } from './HeaderLock.style'

type Props = {
  isLocked: boolean
  onPress?: () => void
  isDesktopView: boolean
}

const HeaderLock: React.FC<Props> = (props: Props): JSX.Element => {
  const { isLocked, onPress = () => {}, isDesktopView } = props

  const { theme$ } = useThemeContext()
  const theme = useObservableState(theme$)

  const color = useMemo(() => palette('text', 0)({ theme }), [theme])

  const iconStyle = { fontSize: '1.5em', marginLeft: '20px' }

  const clickHandler = (_: React.MouseEvent) => onPress()

  // Desktop view displays current lock status
  const desktopView = useMemo(
    () => (
      <>
        {isLocked && <LockIcon style={iconStyle} />}
        {!isLocked && <UnlockIcon style={iconStyle} />}
      </>
    ),
    [iconStyle, isLocked]
  )

  // Mobile view is different, it does not show current lock status.
  // It includes a label + icon of a lock status an user can switch to
  const mobileView = useMemo(() => {
    const label = isLocked ? 'Unlock wallet' : 'Lock wallet'
    return (
      <>
        {!isDesktopView && <Text style={{ color, textTransform: 'uppercase' }}>{label}</Text>}
        {!isLocked && <LockIcon style={iconStyle} />}
        {isLocked && <UnlockIcon style={iconStyle} />}
      </>
    )
  }, [color, iconStyle, isDesktopView, isLocked])

  return (
    <HeaderLockWrapper onClick={clickHandler}>
      {!isDesktopView && mobileView}
      {isDesktopView && desktopView}
    </HeaderLockWrapper>
  )
}

export default HeaderLock
