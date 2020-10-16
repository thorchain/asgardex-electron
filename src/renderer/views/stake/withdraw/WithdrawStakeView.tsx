import React from 'react'

import { Asset } from '@thorchain/asgardex-util'

import WithdrawStake from '../../../components/stake/withdraw/WithdrawStake'

type Props = {
  asset: Asset
  runeAsset: Asset
}

const WithdrawStakeView: React.FC<Props> = (props): JSX.Element => {
  const { asset, runeAsset } = props

  return <WithdrawStake asset={asset} runeAsset={runeAsset} />
}

export default WithdrawStakeView
