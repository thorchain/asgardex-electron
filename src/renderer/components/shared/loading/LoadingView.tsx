import React from 'react'

import { Spin } from 'antd'
import { useIntl } from 'react-intl'

import * as Styled from './LoadingView.styles'

type LoadingViewProps = {
  text?: string
}

export const LoadingView: React.FC<LoadingViewProps> = ({ text }) => {
  const intl = useIntl()
  return (
    <Styled.Space>
      <Spin size="large" tip={text || intl.formatMessage({ id: 'common.loading' })} />
    </Styled.Space>
  )
}
