import React from 'react'

import { Asset } from '@xchainjs/xchain-util'

import { Chain } from '../../../../shared/utils/chain'
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
