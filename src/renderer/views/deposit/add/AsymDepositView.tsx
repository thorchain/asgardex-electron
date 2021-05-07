import React from 'react'

import { Asset } from '@xchainjs/xchain-util'

import { AsymDeposit } from '../../../components/deposit/add'
import { PoolDetailRD } from '../../../services/midgard/types'

type Props = {
  asset: Asset
  poolDetail: PoolDetailRD
}

export const AsymDepositView: React.FC<Props> = () => {
  return <AsymDeposit />
}
