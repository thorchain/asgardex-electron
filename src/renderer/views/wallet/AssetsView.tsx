import React, { useCallback } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Asset, assetToString } from '@thorchain/asgardex-util'
import { useObservableState } from 'observable-hooks'
import { useHistory } from 'react-router-dom'

import AssetsTableCollapsable from '../../components/wallet/assets/AssetsTableCollapsable'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { useWalletContext } from '../../contexts/WalletContext'
import { getDefaultRuneAsset } from '../../helpers/assetHelper'
import { getRunePricePool } from '../../helpers/poolHelper'
import * as walletRoutes from '../../routes/wallet'
import { AssetsWBChains } from '../../services/wallet/types'

const AssetsView: React.FC = (): JSX.Element => {
  const history = useHistory()
  const { assetsWBChains$ } = useWalletContext()

  const assetsWBChains = useObservableState(assetsWBChains$, [] as AssetsWBChains)

  const {
    service: {
      pools: { runeAsset$, poolsState$, selectedPricePool$ }
    }
  } = useMidgardContext()

  const runeAsset = useObservableState(runeAsset$, getDefaultRuneAsset())
  const poolsRD = useObservableState(poolsState$, RD.pending)

  const selectedPricePool = useObservableState(selectedPricePool$, getRunePricePool(runeAsset))

  const selectAssetHandler = useCallback(
    (asset: Asset) => history.push(walletRoutes.assetDetail.path({ asset: assetToString(asset) })),
    [history]
  )

  const poolDetails = RD.toNullable(poolsRD)?.poolDetails ?? []

  return (
    <AssetsTableCollapsable
      assetsWBChains={assetsWBChains}
      pricePool={selectedPricePool}
      poolDetails={poolDetails}
      selectAssetHandler={selectAssetHandler}
    />
  )
}

export default AssetsView
