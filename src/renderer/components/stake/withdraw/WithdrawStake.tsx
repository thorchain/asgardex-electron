import React from 'react'

import { Asset, assetToString } from '@thorchain/asgardex-util'

type Props = {
  asset: Asset
  runeAsset: Asset
}

export const WithdrawStake: React.FC<Props> = (props): JSX.Element => {
  const { asset, runeAsset } = props

  return (
    <h1>
      Withdraw {assetToString(asset)} {assetToString(runeAsset)}
    </h1>
  )
}
