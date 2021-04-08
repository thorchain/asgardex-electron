import React from 'react'

import { useIntl } from 'react-intl'

import { HeaderIconWrapper } from '../HeaderIcon.style'
import * as Styled from './HeaderSettings.style'

type Props = {
  onPress?: () => void
  isDesktopView: boolean
}

export const HeaderSettings: React.FC<Props> = (props): JSX.Element => {
  const { onPress = () => {}, isDesktopView } = props
  const intl = useIntl()

  return (
    <HeaderIconWrapper onClick={onPress}>
      {!isDesktopView && <Styled.Label>{intl.formatMessage({ id: 'setting.title' })} </Styled.Label>}
      <Styled.Icon />
    </HeaderIconWrapper>
  )
}
