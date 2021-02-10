import React, { useCallback } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Asset, assetToString } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import { useObservableState } from 'observable-hooks'
import { useHistory } from 'react-router-dom'
import * as RxOp from 'rxjs/operators'

import { AssetsTableCollapsable } from '../../components/wallet/assets/AssetsTableCollapsable'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { useWalletContext } from '../../contexts/WalletContext'
import { RUNE_PRICE_POOL } from '../../helpers/poolHelper'
import * as walletRoutes from '../../routes/wallet'
import { ChainBalances } from '../../services/wallet/types'

export const AssetsView: React.FC = (): JSX.Element => {
  const history = useHistory()
  const { chainBalances$, setSelectedAsset } = useWalletContext()

  // accept balances > 0 only
  const [chainBalances] = useObservableState(
    () =>
      chainBalances$.pipe(
        RxOp.map((chainBalances) =>
          chainBalances.map((chainBalance) => ({
            ...chainBalance,
            balances: FP.pipe(
              chainBalance.balances,
              RD.map((balances) => balances.filter((balance) => balance.amount.amount().isGreaterThan(0)))
            )
          }))
        )
      ),
    [] as ChainBalances
  )

  const {
    service: {
      pools: { poolsState$, selectedPricePool$ }
    }
  } = useMidgardContext()

  const poolsRD = useObservableState(poolsState$, RD.pending)

  const selectedPricePool = useObservableState(selectedPricePool$, RUNE_PRICE_POOL)

  const selectAssetHandler = useCallback(
    (asset: Asset, walletAddress: string) =>
      history.push(walletRoutes.assetDetail.path({ asset: assetToString(asset), walletAddress })),
    [history]
  )

  const poolDetails = RD.toNullable(poolsRD)?.poolDetails ?? []

  return (
    <AssetsTableCollapsable
      chainBalances={chainBalances}
      pricePool={selectedPricePool}
      poolDetails={poolDetails}
      selectAssetHandler={selectAssetHandler}
      setSelectedAsset={setSelectedAsset}
    />
  )
}
