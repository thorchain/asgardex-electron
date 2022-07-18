import React from 'react'

import { ResultProps } from 'antd/lib/result'

import * as Styled from './ErrorView.styles'

export type Props = Omit<ResultProps, 'icon'>

export const ErrorView: React.FC<Props> = (props): JSX.Element => (
  <Styled.Result
    icon={
      <Styled.IconWrapper>
        <Styled.Icon />
      </Styled.IconWrapper>
    }
    {...props}
  />
)
