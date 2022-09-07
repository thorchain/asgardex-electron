import React from 'react'

import { CogIcon } from '@heroicons/react/solid'
import { useIntl } from 'react-intl'

import { Tooltip } from '../../uielements/common/Common.styles'
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
      <Tooltip title={intl.formatMessage({ id: 'common.settings' })}>
        <CogIcon className="h-[28px] w-[28px] text-text2 dark:text-text2d" />
      </Tooltip>
    </HeaderIconWrapper>
  )
}
