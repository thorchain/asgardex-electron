import React from 'react'

import SyncIcon from '@ant-design/icons/SyncOutlined'
import * as FP from 'fp-ts/function'
import { useIntl } from 'react-intl'

import * as Styled from './RefreshButton.styles'

type Props = {
  label?: string
  clickHandler?: React.MouseEventHandler<HTMLElement>
  disabled?: boolean
}

export const RefreshButton: React.FC<Props> = (props): JSX.Element => {
  const { label, clickHandler = FP.constVoid, disabled } = props
  const intl = useIntl()

  return (
    <Styled.RefreshButton typevalue="transparent" type="text" onClick={clickHandler} disabled={disabled}>
      <SyncIcon />
      {label || intl.formatMessage({ id: 'common.refresh' })}
    </Styled.RefreshButton>
  )
}
