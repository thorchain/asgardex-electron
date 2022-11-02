import React from 'react'

import { ResultProps } from 'antd/lib/result'

import * as RStyled from '../result/ResultView.styles'
import * as Styled from './ErrorView.styles'

export type Props = Omit<ResultProps, 'icon'>

export const ErrorView: React.FC<Props> = (props): JSX.Element => (
  <RStyled.Result
    icon={
      <RStyled.IconWrapper>
        <Styled.Icon />
      </RStyled.IconWrapper>
    }
    {...props}
  />
)
