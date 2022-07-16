import React from 'react'

import { useIntl } from 'react-intl'

import { HeaderIconWrapper } from '../HeaderIcon.styles'
import * as Styled from './HeaderSettings.styles'

export type Props = {
  onPress?: () => void
  isDesktopView: boolean
}

export const HeaderSettings: React.FC<Props> = (props): JSX.Element => {
  const { onPress = () => {}, isDesktopView } = props
  const intl = useIntl()

  return (
    <HeaderIconWrapper onClick={onPress}>
      {!isDesktopView && <Styled.Label>{intl.formatMessage({ id: 'common.settings' })} </Styled.Label>}
      <Styled.Icon />
    </HeaderIconWrapper>
  )
}
