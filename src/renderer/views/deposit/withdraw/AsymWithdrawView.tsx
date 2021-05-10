import React from 'react'

import { Asset } from '@xchainjs/xchain-util'

import { AsymWithdraw } from '../../../components/deposit/withdraw'
import { PoolDetailRD } from '../../../services/midgard/types'

type Props = {
  asset: Asset
  poolDetail: PoolDetailRD
}

export const AsymWithdrawView: React.FC<Props> = () => {
  return <AsymWithdraw />
}
