import React from 'react'

import { Cog8ToothIcon } from '@heroicons/react/20/solid'
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
    <HeaderIconWrapper className="group" onClick={onPress}>
      {!isDesktopView && <Styled.Label>{intl.formatMessage({ id: 'common.settings' })} </Styled.Label>}
      <Tooltip title={intl.formatMessage({ id: 'common.settings' })}>
        <Cog8ToothIcon className="ease h-[24px] w-[24px] text-text2 group-hover:rotate-180 dark:text-text2d" />
      </Tooltip>
    </HeaderIconWrapper>
  )
}
