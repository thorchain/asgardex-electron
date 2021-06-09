/* eslint-disable */
import React, { useCallback, useEffect, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Address } from '@xchainjs/xchain-client'
import { assetToString } from '@xchainjs/xchain-util'
import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/function'
import * as NEA from 'fp-ts/NonEmptyArray'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { ONE_RUNE_BASE_AMOUNT } from '../../../../shared/mock/amount'
import { AssetDetails } from '../../../components/wallet/assets'
import { ZERO_BASE_AMOUNT } from '../../../const'
import { useChainContext } from '../../../contexts/ChainContext'
import { useMidgardContext } from '../../../contexts/MidgardContext'
import { useThorchainContext } from '../../../contexts/ThorchainContext'
import { isRuneNativeAsset } from '../../../helpers/assetHelper'
import { eqAsset } from '../../../helpers/fp/eq'
import { liveData } from '../../../helpers/rx/liveData'
import { GetExplorerTxUrl, LoadTxsParams, TxsPageRD } from '../../../services/clients'
import { ENABLED_CHAINS } from '../../../services/const'
import { useWalletContext } from '../../../contexts/WalletContext'
import { LoadTxsHandler } from '../../../services/wallet/types'
import { CommonAssetDetailsProps } from './types'

export const AssetDetailsInternalHistoryView: React.FC<CommonAssetDetailsProps> = ({
  walletAddress: oWalletAddress,
  network,
  asset,
  historyExtraContent,
  balances: walletBalances,
  getExplorerTxUrl
}) => {
  const { getTxs$, loadTxs: load, reloadBalancesByChain, resetTxsPage } = useWalletContext()

  const [txsRD] = useObservableState(() => getTxs$(oWalletAddress, true), RD.initial)

  useEffect(() => {
    return () => resetTxsPage()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    console.log('txsRD - ', txsRD)
  }, [txsRD])

  const loadTxs: LoadTxsHandler = useCallback(
    (params) => {
      load({
        ...params,
        internal: true
      })
    },
    [load]
  )

  return (
    <AssetDetails
      historyExtraContent={historyExtraContent}
      txsPageRD={txsRD}
      balances={walletBalances}
      asset={asset}
      loadTxsHandler={loadTxs}
      reloadBalancesHandler={reloadBalancesByChain(asset.chain)}
      getExplorerTxUrl={getExplorerTxUrl}
      walletAddress={oWalletAddress}
      network={network}
    />
  )
}

// export const AssetDetailsInternalHistoryView: React.FC<CommonAssetDetailsProps> = ({
//   // walletAddress: oWalletAddress,
//   walletAddress,
//   network,
//   asset,
//   historyExtraContent,
//   balances: walletBalances,
//   // getExplorerTxUrl,
//   reloadBalancesHandler
// }) => {
//   const {
//     service: {
//       poolActionsHistory: { actions$, loadActionsHistory, reloadActionsHistory: _, resetActionsData }
//     }
//   } = useMidgardContext()
//
//   const { getExplorerTxUrl$ } = useThorchainContext()
//
//   // const oWalletAddress = useObservableState(address$, O.none)
//
//   const { addressByChain$ } = useChainContext()
//
//   const [addresses] = useObservableState<Address[]>(
//     () =>
//       FP.pipe(
//         ENABLED_CHAINS,
//         A.map(addressByChain$),
//         (addresses) => Rx.combineLatest(addresses),
//         RxOp.map(A.filterMap(FP.identity))
//       ),
//     []
//   )
//
//   const oWalletAddress = useMemo(
//     () =>
//       FP.pipe(
//         NEA.fromArray(addresses),
//         O.map((s) => s.join(','))
//       ),
//     [addresses]
//   )
//
//   useEffect(() => {
//     console.log('oWalletAddress - ', oWalletAddress)
//   }, [oWalletAddress])
//
//   const getExplorerTxUrl = useObservableState<O.Option<GetExplorerTxUrl>>(getExplorerTxUrl$, O.none)
//
//   const [txsRD] = useObservableState<TxsPageRD>(
//     () =>
//       FP.pipe(
//         actions$,
//         liveData.map(({ total, actions }) => {
//           return {
//             total,
//             txs: FP.pipe(
//               actions,
//               A.map((action) => {
//                 const _amount = FP.pipe(action.out)
//
//                 // if (isRuneNativeAsset(asset)) {
//                 //   return {
//                 //     asset,
//                 //     from: FP.pipe(
//                 //       action.out,
//                 //       A.map((totx) => ({
//                 //         from: totx.address,
//                 //         amount: ONE_RUNE_BASE_AMOUNT
//                 //       }))
//                 //     ),
//                 //     to: FP.pipe(
//                 //       action.in,
//                 //       A.map((intx) => ({
//                 //         to: intx.address,
//                 //         amount: intx.values[0].amount
//                 //       }))
//                 //     ),
//                 //     date: new Date(action.date),
//                 //     type: 'unknown' as const,
//                 //     hash: action.in[0].txID
//                 //   }
//                 // }
//
//                 return {
//                   asset,
//                   from: FP.pipe(
//                     action.in,
//                     A.map((totx) => ({
//                       from: totx.address,
//                       amount: ONE_RUNE_BASE_AMOUNT
//                     }))
//                   ),
//                   to: FP.pipe(
//                     action.out,
//                     A.filterMap((intx) => {
//                       if (!eqAsset.equals(intx.values[0].asset, asset)) {
//                         // return O.some({
//                         //   to: intx.address,
//                         //   amount: intx.values[0].amount
//                         // })
//                         return O.none
//                       }
//                       return O.some({
//                         to: intx.address,
//                         amount: intx.values[0].amount
//                       })
//                     })
//                   ),
//                   date: new Date(action.date),
//                   type: 'unknown' as const,
//                   hash: action.in[0].txID
//                 }
//               })
//             )
//           }
//         })
//       ),
//     RD.initial
//   )
//
//   const load = useCallback(
//     (params: LoadTxsParams) => {
//       FP.pipe(
//         oWalletAddress,
//         O.map((walletAddress) => {
//           loadActionsHistory({
//             asset: assetToString(asset),
//             addresses: [walletAddress],
//             itemsPerPage: params.limit,
//             page: Math.trunc(params.offset / params.limit)
//           })
//         })
//       )
//     },
//     [loadActionsHistory, asset, oWalletAddress]
//   )
//
//   useEffect(() => {
//     load({
//       limit: 10,
//       offset: 0
//     })
//     return () => resetActionsData()
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [oWalletAddress])
//
//   return (
//     <AssetDetails
//       historyExtraContent={historyExtraContent}
//       txsPageRD={txsRD}
//       balances={walletBalances}
//       asset={asset}
//       loadTxsHandler={load}
//       reloadBalancesHandler={reloadBalancesHandler}
//       getExplorerTxUrl={getExplorerTxUrl}
//       walletAddress={walletAddress}
//       network={network}
//     />
//   )
// }
