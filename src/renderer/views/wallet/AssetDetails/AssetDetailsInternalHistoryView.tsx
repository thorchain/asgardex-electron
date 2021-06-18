import React, { useCallback, useEffect, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Asset, assetToString } from '@xchainjs/xchain-util'
import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/function'
import * as NEA from 'fp-ts/NonEmptyArray'
import * as O from 'fp-ts/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'

import { AssetDetails } from '../../../components/wallet/assets'
import { ZERO_BASE_AMOUNT } from '../../../const'
import { useMidgardContext } from '../../../contexts/MidgardContext'
import { useThorchainContext } from '../../../contexts/ThorchainContext'
import { eqString } from '../../../helpers/fp/eq'
import { liveData } from '../../../helpers/rx/liveData'
import { GetExplorerTxUrl, LoadTxsParams, TxsPageRD } from '../../../services/clients'
import { Tx } from '../../../services/midgard/types'
import { CommonAssetDetailsProps } from './types'

const compareAssetsByStringValues = (a: Asset) => (b: Asset) =>
  // Midgard always provides addresses in Upper-case which does not match to our stored address
  // so we have to compare asset's string casted to a single case
  eqString.equals(assetToString(a).toLowerCase(), assetToString(b).toLowerCase())

const filterValuesByAsset = (asset: Asset) => (txs: Tx[]) => {
  const isTargetAsset = compareAssetsByStringValues(asset)
  return FP.pipe(
    txs,
    A.map((action) => ({
      ...action,
      values: FP.pipe(
        action.values,
        A.filterMap((value) => (isTargetAsset(value.asset) ? O.some(value) : O.none))
      )
    }))
  )
}

export const AssetDetailsInternalHistoryView: React.FC<CommonAssetDetailsProps> = ({
  walletAddress,
  network,
  asset,
  historyExtraContent,
  balances: walletBalances,
  reloadBalancesHandler
}) => {
  const {
    service: {
      poolActionsHistory: { actions$, loadActionsHistory, resetActionsData }
    }
  } = useMidgardContext()

  const { getExplorerTxUrl$ } = useThorchainContext()

  const getExplorerTxUrl = useObservableState<O.Option<GetExplorerTxUrl>>(getExplorerTxUrl$, O.none)

  const intl = useIntl()

  const poolLabel = useMemo(() => intl.formatMessage({ id: 'common.pool' }).toUpperCase(), [intl])
  const selfLabel = useMemo(() => intl.formatMessage({ id: 'common.address.self' }).toUpperCase(), [intl])

  const [txsRD] = useObservableState<TxsPageRD>(
    () =>
      FP.pipe(
        actions$,
        liveData.map(({ total, actions }) => {
          const isTargetAsset = compareAssetsByStringValues(asset)

          return {
            total,
            txs: FP.pipe(
              actions,
              A.map((action) => {
                // Check if there is target asset inside of incoming to the wallet txs
                const isIncomingTx: boolean = FP.pipe(
                  action.out,
                  A.map(({ values }) => values),
                  A.flatten,
                  A.findFirst(({ asset }) => isTargetAsset(asset)),
                  O.isNone
                )

                const to = FP.pipe(
                  // Incoming txs TO the pool means that user sent this amounts
                  action.in,
                  filterValuesByAsset(asset),
                  // Now we have only asset's txs related to the action
                  // And collect all sub-transactions of an action to a plain array
                  A.map((tx) =>
                    FP.pipe(
                      tx.values,
                      A.map((value) => ({
                        amount: value.amount,
                        to: isIncomingTx ? poolLabel : tx.address
                      }))
                    )
                  ),
                  A.flatten,
                  NEA.fromArray,
                  O.chain((tx) =>
                    isIncomingTx
                      ? O.some(tx)
                      : // For incoming tx we need only "poolLabel" and value will be passed via "from" values
                        O.some([
                          {
                            amount: ZERO_BASE_AMOUNT,
                            to: poolLabel
                          }
                        ])
                  ),
                  O.getOrElse(() => [
                    {
                      amount: ZERO_BASE_AMOUNT,
                      to: isIncomingTx ? poolLabel : selfLabel
                    }
                  ])
                )

                const from = FP.pipe(
                  // Out txs from a pool means that user received this amounts
                  action.out,
                  filterValuesByAsset(asset),
                  // Now we have only asset's txs related to the action
                  // And collect all sub-transactions of an action to a plain array
                  A.map((tx) =>
                    FP.pipe(
                      tx.values,
                      A.map((value) => ({
                        from: poolLabel,
                        amount: value.amount
                      }))
                    )
                  ),
                  A.flatten,
                  NEA.fromArray,
                  O.chain((tx) =>
                    !isIncomingTx
                      ? O.some(tx)
                      : // For outgoing tx we need only "selfLabel" and value will be passed via "to" values
                        O.some([
                          {
                            amount: ZERO_BASE_AMOUNT,
                            from: selfLabel
                          }
                        ])
                  ),
                  O.getOrElse(() => [
                    {
                      amount: ZERO_BASE_AMOUNT,
                      from: isIncomingTx ? selfLabel : poolLabel
                    }
                  ])
                )

                return {
                  asset,
                  from,
                  to,
                  date: new Date(action.date),
                  type: action.type,
                  // there is ALWAYS at least one in tx to trigger THOR-Chain's action
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
        walletAddress,
        O.map((walletAddress) =>
          loadActionsHistory({
            // Need to transform to the uppercase as Midgard is case-sensetive and expects assets to be uppercased
            asset: assetToString(asset).toUpperCase(),
            addresses: [walletAddress],
            itemsPerPage: params.limit,
            page: Math.trunc(params.offset / params.limit)
          })
        )
      )
    },
    [loadActionsHistory, asset, walletAddress]
  )

  useEffect(() => {
    load({
      limit: 10,
      offset: 0
    })
    return () => resetActionsData()
    // load data on mount
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
      walletAddress={walletAddress}
      network={network}
    />
  )
}
