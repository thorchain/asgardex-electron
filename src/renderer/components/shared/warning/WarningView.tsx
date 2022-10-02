import React from 'react'

import { ResultProps } from 'antd/lib/result'

import * as RStyled from '../result/ResultView.styles'
import * as Styled from './WarningView.styles'

export type Props = Omit<ResultProps, 'icon'>

export const WarningView: React.FC<Props> = (props): JSX.Element => (
  <RStyled.Result
    icon={
      <RStyled.IconWrapper>
        <Styled.Icon />
      </RStyled.IconWrapper>
    }
    {...props}
  />
)
