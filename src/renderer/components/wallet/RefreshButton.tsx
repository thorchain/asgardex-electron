import React from 'react'

import SyncIcon from '@ant-design/icons/SyncOutlined'
import { useIntl } from 'react-intl'

import * as Styled from './RefreshButton.styles'

type Props = {
  onRefresh: () => void
}

const RefreshButton: React.FC<Props> = ({ onRefresh }) => {
  const intl = useIntl()

  return (
    <Styled.RefreshButton typevalue="transparent" type="text" onClick={onRefresh}>
      <SyncIcon />
      {intl.formatMessage({ id: 'common.refresh' })}
    </Styled.RefreshButton>
  )
}

export default RefreshButton
