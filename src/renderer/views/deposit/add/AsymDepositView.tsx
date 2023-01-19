import React from 'react'

import { Asset, Chain } from '@xchainjs/xchain-util'

import { AsymDeposit } from '../../../components/deposit/add'
import { PoolDetailRD } from '../../../services/midgard/types'

type Props = {
  asset: Asset
  poolDetail: PoolDetailRD
  haltedChains: Chain[]
}

export const AsymDepositView: React.FC<Props> = () => {
  return <AsymDeposit />
}
