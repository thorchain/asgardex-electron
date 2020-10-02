import React, { useEffect, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { assetFromString } from '@thorchain/asgardex-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useParams } from 'react-router-dom'
import * as Rx from 'rxjs'

import AssetDetails from '../../components/wallet/assets/AssetDetails'
import { useBinanceContext } from '../../contexts/BinanceContext'
import { useWalletContext } from '../../contexts/WalletContext'
import { AssetDetailsParams } from '../../routes/wallet'
import { INITIAL_ASSETS_WB_STATE } from '../../services/wallet/const'

const AssetDetailsView: React.FC = (): JSX.Element => {
  const { txsSelectedAsset$, setSelectedAsset } = useBinanceContext()
  const { assetsWBState$, reloadAssetTxsByChain, reloadBalancesByChain, explorerTxUrlByChain$ } = useWalletContext()

  const { asset } = useParams<AssetDetailsParams>()
  const selectedAsset = O.fromNullable(assetFromString(asset))

  const txsRD = useObservableState(txsSelectedAsset$, RD.initial)
  const { assetsWB } = useObservableState(assetsWBState$, INITIAL_ASSETS_WB_STATE)

  const reloadBalances = FP.pipe(
    selectedAsset,
    O.map(({ chain }) => () => reloadBalancesByChain(chain)),
    O.toUndefined
  )

  const reloadAssetTxs = FP.pipe(
    selectedAsset,
    O.map(({ chain }) => reloadAssetTxsByChain(chain)),
    O.toUndefined
  )

  const explorerTxUrl$ = useMemo(
    () =>
      FP.pipe(
        selectedAsset,
        O.fold(
          () => Rx.of(O.none),
          ({ chain }) => explorerTxUrlByChain$(chain)
        )
      ),
    [explorerTxUrlByChain$, selectedAsset]
  )

  const explorerTxUrl = useObservableState(explorerTxUrl$, O.none)

  // Set selected asset to trigger dependent streams to get all needed data (such as its transactions)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setSelectedAsset(selectedAsset), [])

  return (
    <>
      <h1>{JSON.stringify(explorerTxUrl)}</h1>
      <AssetDetails
        txsPageRD={txsRD}
        assetsWB={assetsWB}
        asset={selectedAsset}
        loadSelectedAssetTxsHandler={reloadAssetTxs}
        reloadBalancesHandler={reloadBalances}
        explorerTxUrl={O.none}
      />
    </>
  )
}
export default AssetDetailsView
