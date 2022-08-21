import React from 'react'

import { SpinSize } from 'antd/lib/spin'
import { useIntl } from 'react-intl'

import * as Styled from './LoadingView.styles'

export type Props = {
  label?: string
  size?: SpinSize
  className?: string
}

export const LoadingView: React.FC<Props> = ({ label, size = 'default', className }) => {
  const intl = useIntl()
  return (
    <Styled.Space className={className}>
      <Styled.Spin size={size} tip={label || intl.formatMessage({ id: 'common.loading' })} />
    </Styled.Space>
  )
}
