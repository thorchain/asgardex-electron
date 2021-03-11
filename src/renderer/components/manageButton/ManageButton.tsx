import React, { useCallback } from 'react'

import { PlusOutlined } from '@ant-design/icons'
import { Asset, assetToString } from '@xchainjs/xchain-util'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router'

import * as depositRoutes from '../../routes/deposit'
import { Button, ButtonSize } from '../uielements/button'

type Props = {
  className?: string
  asset: Asset
  sizevalue?: ButtonSize
  isTextView: boolean
}
export const ManageButton: React.FC<Props> = ({ className, asset, sizevalue = 'normal', isTextView }) => {
  const intl = useIntl()
  const history = useHistory()

  const onClick = useCallback(() => history.push(depositRoutes.deposit.path({ asset: assetToString(asset) })), [
    asset,
    history
  ])

  return (
    <Button
      round="true"
      typevalue="outline"
      sizevalue={sizevalue}
      className={className}
      onClick={onClick}
      style={{ height: 30 }}>
      <PlusOutlined />
      {isTextView && intl.formatMessage({ id: 'common.manage' })}
    </Button>
  )
}
