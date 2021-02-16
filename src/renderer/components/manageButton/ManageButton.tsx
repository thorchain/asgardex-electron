import React, { useCallback } from 'react'

import { PlusOutlined } from '@ant-design/icons'
import { Asset, assetToString } from '@xchainjs/xchain-util'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router'

import * as depositRoutes from '../../routes/deposit'
import * as Styled from './ManageButton.styles'

type Props = {
  className?: string
  asset: Asset
}
export const ManageButton: React.FC<Props> = ({ className, asset }) => {
  const intl = useIntl()
  const history = useHistory()

  const onClick = useCallback(() => history.push(depositRoutes.deposit.path({ asset: assetToString(asset) })), [
    asset,
    history
  ])

  return (
    <Styled.ManageButton className={className} onClick={onClick}>
      <PlusOutlined />
      {intl.formatMessage({ id: 'common.manage' })}
    </Styled.ManageButton>
  )
}
