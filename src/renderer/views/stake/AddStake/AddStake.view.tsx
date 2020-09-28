import React, { useCallback } from 'react'

import { Asset, assetAmount, assetToBase, assetToString, bn } from '@thorchain/asgardex-util'
import { useHistory } from 'react-router'

import { ASSETS_MAINNET } from '../../../../shared/mock/assets'
import { AddStake } from '../../../components/stake/AddStake/AddStake'
import { ONE_ASSET_BASE_AMOUNT } from '../../../const'
import * as stakeRoutes from '../../../routes/stake'
import { getDefaultRuneAsset } from '../../../services/midgard/pools'

export const AddStakeView: React.FC<{ asset: Asset }> = ({ asset }) => {
  const history = useHistory()

  const onChangeAsset = useCallback(
    (asset: Asset) => {
      history.replace(stakeRoutes.stake.path({ asset: assetToString(asset) }))
    },
    [history]
  )

  return (
    <AddStake
      onChangeAsset={onChangeAsset}
      asset={asset}
      runeAsset={getDefaultRuneAsset()}
      assetPrice={bn(56)}
      runePrice={bn(1)}
      assetAmount={assetToBase(assetAmount(200))}
      runeAmount={assetToBase(assetAmount(200))}
      onStake={console.log}
      assetData={[
        {
          asset: ASSETS_MAINNET.BNB,
          price: ONE_ASSET_BASE_AMOUNT
        },
        {
          asset: ASSETS_MAINNET.TOMO,
          price: ONE_ASSET_BASE_AMOUNT
        }
      ]}
    />
  )
}
