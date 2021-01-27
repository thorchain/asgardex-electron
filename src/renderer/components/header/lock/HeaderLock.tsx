import React, { useCallback, useMemo } from 'react'

import Text from 'antd/lib/typography/Text'
import { useObservableState } from 'observable-hooks'
import { palette } from 'styled-theme'

import { ReactComponent as LockWarningIcon } from '../../../assets/svg/icon-lock-warning.svg'
import { ReactComponent as UnlockWarningIcon } from '../../../assets/svg/icon-unlock-warning.svg'
import { useThemeContext } from '../../../contexts/ThemeContext'
import { HeaderIconWrapper } from '../HeaderIcon.style'

type Props = {
  isLocked: boolean
  onPress?: () => void
  isDesktopView: boolean
  disabled?: boolean
}

export const HeaderLock: React.FC<Props> = (props): JSX.Element => {
  const { isLocked, onPress = () => {}, isDesktopView, disabled = false } = props

  const { theme$ } = useThemeContext()
  const theme = useObservableState(theme$)

  const color = useMemo(() => palette('text', 0)({ theme }), [theme])

  const iconStyle = useMemo(() => ({ fontSize: '1.5em', cursor: disabled ? 'not-allowed' : 'pointer' }), [disabled])

  const clickHandler = useCallback((_: React.MouseEvent) => onPress(), [onPress])

  // Desktop view displays current lock status
  const desktopView = useMemo(
    () => (
      <>
        {isLocked && <LockWarningIcon style={iconStyle} />}
        {!isLocked && <UnlockWarningIcon style={iconStyle} />}
      </>
    ),
    [iconStyle, isLocked]
  )

  const mobileView = useMemo(() => {
    const label = isLocked ? 'Unlock wallet' : 'Lock wallet'
    return (
      <>
        {!isDesktopView && <Text style={{ color, textTransform: 'uppercase' }}>{label}</Text>}
        {!isLocked && <UnlockWarningIcon style={iconStyle} />}
        {isLocked && <LockWarningIcon style={iconStyle} />}
      </>
    )
  }, [color, iconStyle, isDesktopView, isLocked])

  return (
    <HeaderIconWrapper onClick={clickHandler} disabled={disabled}>
      {!isDesktopView && mobileView}
      {isDesktopView && desktopView}
    </HeaderIconWrapper>
  )
}
