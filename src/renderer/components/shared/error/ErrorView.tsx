import React from 'react'

import { InfoCircleOutlined } from '@ant-design/icons'
import Title from 'antd/lib/typography/Title'

import { ErrorWrapper } from './ErrorView.style'

type Props = { message: string }

const ErrorView: React.FC<Props> = (props: Props): JSX.Element => {
  const { message } = props
  return (
    <ErrorWrapper>
      <div className="icon">
        <InfoCircleOutlined />
      </div>
      <Title level={4} className="message">
        {message}
      </Title>
    </ErrorWrapper>
  )
}

export default ErrorView
