import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Balances } from '@thorchain/asgardex-binance'
import { AssetAmount } from '@thorchain/asgardex-util'
import { shell } from 'electron'
import { sequenceT } from 'fp-ts/lib/Apply'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { combineLatest, Observable } from 'rxjs'
import { map, pairwise, startWith } from 'rxjs/operators'

import AssetDetails from '../../components/wallet/AssetDetails'
import { useBinanceContext } from '../../contexts/BinanceContext'
import { balanceByAsset } from '../../helpers/binanceHelper'

const M = O.getLastMonoid<AssetAmount>()

const AssetDetailsView: React.FC = (): JSX.Element => {
  const {
    txsSelectedAsset$,
    address$,
    balancesState$,
    selectedAsset$,
    reloadBalances,
    reloadTxssSelectedAsset,
    explorerUrl$
  } = useBinanceContext()
  const txsRD = useObservableState(txsSelectedAsset$, RD.initial)
  const address = useObservableState(address$, O.none)
  const selectedAsset = useObservableState(selectedAsset$, O.none)
  const explorerUrl = useObservableState(explorerUrl$, O.none)

  const oBalances$: Observable<O.Option<Balances>> = balancesState$.pipe(map(RD.toOption), startWith(O.none))

  const balance$ = combineLatest([oBalances$, selectedAsset$]).pipe(
    map(([balances, asset]) =>
      FP.pipe(
        sequenceT(O.option)(balances, asset),
        O.chain(([b, a]) => O.some(balanceByAsset(b, a)))
      )
    ),
    pairwise(),
    map(([prev, next]) => M.concat(prev, next))
  )

  const balance = useObservableState(balance$, O.none)

  return (
    <AssetDetails
      txsRD={txsRD}
      address={address}
      asset={selectedAsset}
      balance={balance}
      reloadSelectedAssetTxsHandler={reloadTxssSelectedAsset}
      reloadBalancesHandler={reloadBalances}
      explorerUrl={explorerUrl}
      openExternal={shell.openExternal}
    />
  )
}
export default AssetDetailsView
