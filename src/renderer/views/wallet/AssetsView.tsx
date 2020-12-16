import React, { useCallback } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Asset, assetToString } from '@xchainjs/xchain-util'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import { useObservableState } from 'observable-hooks'
import { useHistory } from 'react-router-dom'
import * as RxOp from 'rxjs/operators'

import { AssetsTableCollapsable } from '../../components/wallet/assets/AssetsTableCollapsable'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { useWalletContext } from '../../contexts/WalletContext'
import {} from '../../helpers/assetHelper'
import { getDefaultRunePricePool } from '../../helpers/poolHelper'
import * as walletRoutes from '../../routes/wallet'
import { ChainBalance, ChainBalancesRD } from '../../services/wallet/types'

export const AssetsView: React.FC = (): JSX.Element => {
  const history = useHistory()
  const { balances$: walletBalances$ } = useWalletContext()

  const [walletBalances] = useObservableState(
    () =>
      walletBalances$.pipe(
        RxOp.map(
          FP.flow(
            A.map(
              RD.map(
                (balances) =>
                  ({
                    address: balances[0].walletAddress,
                    chain: balances[0].asset.chain,
                    balances
                  } as ChainBalance)
              )
            )
          )
        )
      ),
    [] as ChainBalancesRD[]
  )

  const {
    service: {
      pools: { poolsState$, selectedPricePool$ }
    }
  } = useMidgardContext()

  const poolsRD = useObservableState(poolsState$, RD.pending)

  const selectedPricePool = useObservableState(selectedPricePool$, getDefaultRunePricePool())

  const selectAssetHandler = useCallback(
    (asset: Asset, walletAddress: string) =>
      history.push(walletRoutes.assetDetail.path({ asset: assetToString(asset), walletAddress })),
    [history]
  )

  const poolDetails = RD.toNullable(poolsRD)?.poolDetails ?? []

  return (
    <AssetsTableCollapsable
      chainBalances={walletBalances}
      pricePool={selectedPricePool}
      poolDetails={poolDetails}
      selectAssetHandler={selectAssetHandler}
    />
  )
}
