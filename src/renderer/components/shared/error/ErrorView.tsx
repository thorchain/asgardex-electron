import React from 'react'

import { ResultProps } from 'antd/lib/result'

import * as Styled from './ErrorView.style'

type Props = Omit<ResultProps, 'icon'>

const ErrorView: React.FC<Props> = (props): JSX.Element => (
  <Styled.Result
    icon={
      <Styled.IconWrapper>
        <Styled.Icon />
      </Styled.IconWrapper>
    }
    {...props}
  />
)

export default ErrorView
