import React from 'react'

import { SpinSize } from 'antd/lib/spin'
import { useIntl } from 'react-intl'

import * as Styled from './LoadingView.styles'

type LoadingViewProps = {
  label?: string
  size?: SpinSize
}

export const LoadingView: React.FC<LoadingViewProps> = ({ label, size = 'default' }) => {
  const intl = useIntl()
  return (
    <Styled.Space>
      <Styled.Spin size={size} tip={label || intl.formatMessage({ id: 'common.loading' })} />
    </Styled.Space>
  )
}
