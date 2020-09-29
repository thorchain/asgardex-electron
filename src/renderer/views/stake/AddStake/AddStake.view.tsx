import React, { useCallback } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Asset, assetAmount, assetToBase, assetToString, bn } from '@thorchain/asgardex-util'
import { useObservableState } from 'observable-hooks'
import { useHistory } from 'react-router'

import { ASSETS_MAINNET } from '../../../../shared/mock/assets'
import { AddStake } from '../../../components/stake/AddStake/AddStake'
import { ONE_ASSET_BASE_AMOUNT } from '../../../const'
import { useMidgardContext } from '../../../contexts/MidgardContext'
import { getDefaultRuneAsset } from '../../../helpers/assetHelper'
import * as stakeRoutes from '../../../routes/stake'

export const AddStakeView: React.FC<{ asset: Asset }> = ({ asset }) => {
  const history = useHistory()

  const onChangeAsset = useCallback(
    (asset: Asset) => {
      history.replace(stakeRoutes.stake.path({ asset: assetToString(asset) }))
    },
    [history]
  )

  const { service } = useMidgardContext()

  const runPrice = useObservableState(service.pools.priceRatio$, bn(1))

  const _poolsState = useObservableState(service.pools.poolsState$, RD.initial)

  return (
    <AddStake
      onChangeAsset={onChangeAsset}
      asset={asset}
      runeAsset={getDefaultRuneAsset()}
      assetPrice={bn(56)}
      runePrice={runPrice}
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
