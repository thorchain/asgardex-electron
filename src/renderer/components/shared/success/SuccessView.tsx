import React from 'react'

import { ResultProps } from 'antd/lib/result'

import * as RStyled from '../result/ResultView.styles'
import * as Styled from './SuccessView.style'

export type Props = Omit<ResultProps, 'icon'>

export const SuccessView: React.FC<Props> = (props): JSX.Element => (
  <RStyled.Result
    icon={
      <RStyled.IconWrapper>
        <Styled.Icon />
      </RStyled.IconWrapper>
    }
    {...props}
  />
)
