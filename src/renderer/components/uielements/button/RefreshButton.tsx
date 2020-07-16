import React from 'react'

import SyncIcon from '@ant-design/icons/SyncOutlined'
import { useIntl } from 'react-intl'

import * as Styled from './RefreshButton.styles'

type Props = {
  label?: string
  clickHandler?: () => void
}

const RefreshButton: React.FC<Props> = (props: Props): JSX.Element => {
  const { label, clickHandler = () => {} } = props
  const intl = useIntl()

  return (
    <Styled.RefreshButton typevalue="transparent" type="text" onClick={clickHandler}>
      <SyncIcon />
      {label || intl.formatMessage({ id: 'common.refresh' })}
    </Styled.RefreshButton>
  )
}

export default RefreshButton
