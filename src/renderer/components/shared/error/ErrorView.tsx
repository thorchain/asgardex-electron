import React from 'react'

import { InfoCircleOutlined } from '@ant-design/icons'

import * as Styled from './ErrorView.style'

type Props = { message: string; actionButton?: React.ReactNode }

const ErrorView: React.FC<Props> = (props: Props): JSX.Element => {
  const { message, actionButton } = props
  return (
    <Styled.Wrapper>
      <div className="icon">
        <InfoCircleOutlined />
      </div>
      <Styled.Message level={4}>{message}</Styled.Message>
      {actionButton && <Styled.ActionButtonWrapper>{actionButton}</Styled.ActionButtonWrapper>}
    </Styled.Wrapper>
  )
}

export default ErrorView
