import React, { useCallback, useMemo } from 'react'

import { ThemeType } from '@thorchain/asgardex-theme'
import * as FP from 'fp-ts/lib/function'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import * as RxOp from 'rxjs/operators'

import { useThemeContext } from '../../../contexts/ThemeContext'
import * as Styled from './HeaderTheme.style'

type Props = {
  onPress?: FP.Lazy<void>
  isDesktopView: boolean
}

export const HeaderTheme: React.FC<Props> = (props): JSX.Element => {
  const { onPress = FP.constVoid, isDesktopView } = props
  const { toggleTheme, themeType$ } = useThemeContext()

  const intl = useIntl()

  const [isLightTheme] = useObservableState(() => themeType$.pipe(RxOp.map((type) => type === ThemeType.LIGHT)), false)

  const clickSwitchThemeHandler = useCallback(() => {
    toggleTheme()
    onPress()
  }, [toggleTheme, onPress])

  const desktopView = useMemo(() => (isLightTheme ? <Styled.DayThemeIcon /> : <Styled.NightThemeIcon />), [
    isLightTheme
  ])

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
