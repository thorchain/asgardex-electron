import React, { useEffect, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { assetFromString, BNBChain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'
import * as NEA from 'fp-ts/NonEmptyArray'
import { useObservableState } from 'observable-hooks'
import { useParams } from 'react-router-dom'
import * as RxOp from 'rxjs/operators'

import { AssetDetails } from '../../components/wallet/assets'
import { useBinanceContext } from '../../contexts/BinanceContext'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { useWalletContext } from '../../contexts/WalletContext'
import { sequenceTOption } from '../../helpers/fpHelpers'
import { liveData } from '../../helpers/rx/liveData'
import { AssetDetailsParams } from '../../routes/wallet'
import { getPoolAddressByChain } from '../../services/midgard/utils'
import { INITIAL_BALANCES_STATE } from '../../services/wallet/const'

export const AssetDetailsView: React.FC = (): JSX.Element => {
  const { asset, walletAddress } = useParams<AssetDetailsParams>()
  const oSelectedAsset = useMemo(() => O.fromNullable(assetFromString(asset)), [asset])
  const oWalletAddress = useMemo(() => O.fromNullable(walletAddress || undefined), [walletAddress])

  const {
    getTxs$,
    balancesState$,
    loadTxs,
    reloadBalances$,
    setSelectedAsset,
    getExplorerTxUrl$,
    resetTxsPage
  } = useWalletContext()

  const {
    service: {
      pools: { poolAddresses$ }
    }
  } = useMidgardContext()

  const [bnbPoolAddress] = useObservableState(
    () =>
      FP.pipe(
        poolAddresses$,
        liveData.map((endpoints) => getPoolAddressByChain(endpoints, BNBChain)),
        RxOp.map(FP.flow(RD.toOption, O.flatten))
      ),
    O.none
  )

  const { pushTx: sendBnbTx } = useBinanceContext()

  // Set selected asset once
  // Needed to get all data for this asset (transactions etc.)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setSelectedAsset(oSelectedAsset), [])

  const [txsRD] = useObservableState(() => getTxs$(oWalletAddress), RD.initial)
  const { balances: oBalances } = useObservableState(balancesState$, INITIAL_BALANCES_STATE)

  const [reloadBalances] = useObservableState(() => reloadBalances$.pipe(RxOp.map(O.toUndefined)))
  const getExplorerTxUrl = useObservableState(getExplorerTxUrl$, O.none)

  useEffect(() => {
    return () => resetTxsPage()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /**
   * Need to filter balances only for appropriate wallet
   * as AssetDetails uses just A.findFirst by asset and
   * the first result might be not from needed wallet
   */
  const walletBalances = useMemo(
    () =>
      FP.pipe(
        sequenceTOption(oBalances, oWalletAddress),
        O.map(([balances, walletAddress]) =>
          balances.filter((walletBalance) => walletBalance.walletAddress === walletAddress)
        ),
        O.chain(NEA.fromArray)
      ),
    [oBalances, oWalletAddress]
  )

  return (
    <>
      <AssetDetails
        txsPageRD={txsRD}
        balances={walletBalances}
        asset={oSelectedAsset}
        loadTxsHandler={loadTxs}
        reloadBalancesHandler={reloadBalances}
        getExplorerTxUrl={getExplorerTxUrl}
        walletAddress={oWalletAddress}
        poolAddress={bnbPoolAddress}
        upgradeRuneHandler={sendBnbTx}
      />
    </>
  )
}
