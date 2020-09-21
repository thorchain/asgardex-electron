import React, { useMemo, useCallback } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Asset, assetToString } from '@thorchain/asgardex-util'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useHistory } from 'react-router-dom'

import AssetsTableCollapsable from '../../components/wallet/assets/AssetsTableCollapsable'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { useWalletContext } from '../../contexts/WalletContext'
import * as walletRoutes from '../../routes/wallet'
import { pricePoolSelectorFromRD } from '../../services/midgard/utils'
import { AssetsWBChains } from '../../services/wallet/types'
import { PricePoolAsset } from '../pools/types'

const AssetsView: React.FC = (): JSX.Element => {
  const history = useHistory()
  const { assetsWBChains$ } = useWalletContext()
  const assetsWBChains = useObservableState(assetsWBChains$, [] as AssetsWBChains)

  const {
    service: {
      pools: { getDefaultRuneAsset, poolsState$, selectedPricePoolAsset$ }
    }
  } = useMidgardContext()

  const poolsRD = useObservableState(poolsState$, RD.pending)
  const selectedPricePoolAsset = useObservableState<O.Option<PricePoolAsset>>(
    selectedPricePoolAsset$,
    O.some(getDefaultRuneAsset() as PricePoolAsset)
  )

  const pricePool = useMemo(() => pricePoolSelectorFromRD(poolsRD, selectedPricePoolAsset), [
    poolsRD,
    selectedPricePoolAsset
  ])

  const selectAssetHandler = useCallback(
    (asset: Asset) => history.push(walletRoutes.assetDetail.path({ asset: assetToString(asset) })),
    [history]
  )

  const poolDetails = RD.toNullable(poolsRD)?.poolDetails ?? []

  return (
    <AssetsTableCollapsable
      assetsWBChains={assetsWBChains}
      pricePool={pricePool}
      poolDetails={poolDetails}
      selectAssetHandler={selectAssetHandler}
    />
  )
}

export default AssetsView
