import React, { useCallback, useEffect } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { AssetRuneNative, assetToString } from '@xchainjs/xchain-util'
import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'

import { ONE_RUNE_BASE_AMOUNT } from '../../../../shared/mock/amount'
import { AssetDetails } from '../../../components/wallet/assets'
import { ZERO_BASE_AMOUNT } from '../../../const'
import { useMidgardContext } from '../../../contexts/MidgardContext'
import { liveData } from '../../../helpers/rx/liveData'
import { LoadTxsParams, TxsPageRD } from '../../../services/clients'
import { CommonAssetDetailsProps } from './types'

export const AssetDetailsInternalHistoryView: React.FC<CommonAssetDetailsProps> = ({
  walletAddress: oWalletAddress,
  network,
  asset,
  historyExtraContent,
  balances: walletBalances,
  getExplorerTxUrl,
  reloadBalancesHandler
}) => {
  const {
    service: {
      poolActionsHistory: { actions$, loadActionsHistory, reloadActionsHistory: _, resetActionsData }
    }
  } = useMidgardContext()

  const [txsRD] = useObservableState<TxsPageRD>(
    () =>
      FP.pipe(
        actions$,
        liveData.map(({ total, actions }) => {
          return {
            total,
            txs: FP.pipe(
              actions,
              A.map((action) => {
                const _amount = FP.pipe(action.out)
                return {
                  asset: AssetRuneNative,
                  from: FP.pipe(
                    action.in,
                    A.map((intx) => ({
                      from: intx.address,
                      amount: ZERO_BASE_AMOUNT
                    }))
                  ),
                  to: FP.pipe(
                    action.out,
                    A.map((totx) => ({
                      to: totx.address,
                      amount: ONE_RUNE_BASE_AMOUNT
                    }))
                  ),
                  date: new Date(action.date),
                  type: 'unknown' as const,
                  hash: action.in[0].txID
                }
              })
            )
          }
        })
      ),
    RD.initial
  )

  const load = useCallback(
    (params: LoadTxsParams) => {
      FP.pipe(
        oWalletAddress,
        O.map((walletAddress) => {
          loadActionsHistory({
            asset: assetToString(asset),
            addresses: [walletAddress],
            itemsPerPage: params.limit,
            page: Math.trunc(params.offset / params.limit)
          })
        })
      )
    },
    [loadActionsHistory, asset, oWalletAddress]
  )

  useEffect(() => {
    load({
      limit: 10,
      offset: 0
    })
    return () => resetActionsData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <AssetDetails
      historyExtraContent={historyExtraContent}
      txsPageRD={txsRD}
      balances={walletBalances}
      asset={asset}
      loadTxsHandler={load}
      reloadBalancesHandler={reloadBalancesHandler}
      getExplorerTxUrl={getExplorerTxUrl}
      walletAddress={oWalletAddress}
      network={network}
    />
  )
}
