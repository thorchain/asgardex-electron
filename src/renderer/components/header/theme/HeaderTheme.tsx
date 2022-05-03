import React, { useCallback, useMemo } from 'react'

import * as FP from 'fp-ts/lib/function'
import { useIntl } from 'react-intl'

import { useTheme } from '../../../hooks/useTheme'
import * as Styled from './HeaderTheme.styles'

type Props = {
  onPress?: FP.Lazy<void>
  isDesktopView: boolean
}

export const HeaderTheme: React.FC<Props> = (props): JSX.Element => {
  const { onPress = FP.constVoid, isDesktopView } = props

  const intl = useIntl()

  const { isLight: isLightTheme, toggle: toggleTheme } = useTheme()

  const clickSwitchThemeHandler = useCallback(() => {
    toggleTheme()
    onPress()
  }, [toggleTheme, onPress])

  const desktopView = useMemo(
    () => (isLightTheme ? <Styled.DayThemeIcon /> : <Styled.NightThemeIcon />),
    [isLightTheme]
  )

  const mobileView = useMemo(() => {
    const label = intl.formatMessage({ id: isLightTheme ? 'common.theme.light' : 'common.theme.dark' })

    return (
      <>
        <Styled.Label>{label}</Styled.Label>
        {isLightTheme ? <Styled.DayThemeIcon /> : <Styled.NightThemeIcon />}
      </>
    )
  }, [intl, isLightTheme])

  return (
    <Styled.HeaderThemeWrapper onClick={() => clickSwitchThemeHandler()}>
      {isDesktopView ? desktopView : mobileView}
    </Styled.HeaderThemeWrapper>
  )
}
