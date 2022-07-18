import React from 'react'

import { ResultProps } from 'antd/lib/result'

import * as Styled from './SuccessView.style'

export type Props = Omit<ResultProps, 'icon'>

export const SuccessView: React.FC<Props> = (props): JSX.Element => (
  <Styled.Result
    icon={
      <Styled.IconWrapper>
        <Styled.Icon />
      </Styled.IconWrapper>
    }
    {...props}
  />
)
