import React from 'react'

import { InfoCircleOutlined } from '@ant-design/icons'
import { AlertProps } from 'antd/lib/alert'

import * as Styled from './ErrorAlert.style'

type Props = Omit<AlertProps, 'type' | 'showIcon' | 'icon'>

export const ErrorAlert: React.FC<Props> = (props): JSX.Element => {
  const { description } = props

  return <Styled.Alert type="error" showIcon icon={<InfoCircleOutlined />} description={description} {...props} />
}
