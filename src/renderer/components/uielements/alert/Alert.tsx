import React from 'react'

import { InfoCircleOutlined } from '@ant-design/icons'
import { AlertProps } from 'antd/lib/alert'

import * as Styled from './Alert.styles'

export type Props = Omit<AlertProps, 'showIcon' | 'icon'>

export const Alert: React.FC<Props> = (props): JSX.Element => {
  const { description } = props

  return <Styled.Alert showIcon icon={<InfoCircleOutlined />} description={description} {...props} />
}
