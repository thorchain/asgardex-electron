import React from 'react'

import { CheckCircleOutlined } from '@ant-design/icons'

import * as Styled from './SuccessView.style'

type Props = { message: string; actionButton?: React.ReactNode }

const SuccessView: React.FC<Props> = (props: Props): JSX.Element => {
  const { message, actionButton } = props
  return (
    <Styled.Wrapper>
      <div className="icon">
        <CheckCircleOutlined />
      </div>
      <Styled.Message level={4}>{message}</Styled.Message>
      {actionButton && <Styled.ActionButtonWrapper>{actionButton}</Styled.ActionButtonWrapper>}
    </Styled.Wrapper>
  )
}

export default SuccessView
