import React, { useCallback } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Address } from '@xchainjs/xchain-client'
import { Asset, assetToString } from '@xchainjs/xchain-util'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import { useObservableState } from 'observable-hooks'
import { useHistory } from 'react-router-dom'
import * as RxOp from 'rxjs/operators'

import { Network } from '../../../shared/api/types'
import { WalletType } from '../../../shared/wallet/types'
import { AssetsTableCollapsable } from '../../components/wallet/assets/AssetsTableCollapsable'
import { useAppContext } from '../../contexts/AppContext'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { useWalletContext } from '../../contexts/WalletContext'
import { RUNE_PRICE_POOL } from '../../helpers/poolHelper'
import { useMimirHalt } from '../../hooks/useMimirHalt'
import * as walletRoutes from '../../routes/wallet'
import { DEFAULT_NETWORK } from '../../services/const'
import { ChainBalances } from '../../services/wallet/types'

export const AssetsView: React.FC = (): JSX.Element => {
  const history = useHistory()
  const { chainBalances$, setSelectedAsset } = useWalletContext()

  const { network$ } = useAppContext()
  const network = useObservableState<Network>(network$, DEFAULT_NETWORK)

  const [chainBalances] = useObservableState(
    () =>
      FP.pipe(
        chainBalances$,
        RxOp.map<ChainBalances, ChainBalances>((chainBalances) =>
          FP.pipe(
            chainBalances,
            // we show all balances
            A.filter(({ balanceType }) => balanceType === 'all'),
            // accept balances > 0 only
            A.map((chainBalance) => ({
              ...chainBalance,
              balances: FP.pipe(
                chainBalance.balances,
                RD.map((balances) => balances.filter((balance) => balance.amount.gt(0)))
              )
            }))
          )
        )
      ),
    []
  )

  const {
    service: {
      pools: { poolsState$, selectedPricePool$ }
    }
  } = useMidgardContext()

  const poolsRD = useObservableState(poolsState$, RD.pending)

  const selectedPricePool = useObservableState(selectedPricePool$, RUNE_PRICE_POOL)

  const selectAssetHandler = useCallback(
    ({
      asset,
      walletAddress,
      walletType,
      walletIndex
    }: {
      asset: Asset
      walletAddress: Address
      walletType: WalletType
      walletIndex: number
    }) =>
      history.push(
        walletRoutes.assetDetail.path({
          asset: assetToString(asset),
          walletAddress,
          walletType,
          walletIndex: walletIndex.toString()
        })
      ),
    [history]
  )

  const poolDetails = RD.toNullable(poolsRD)?.poolDetails ?? []

  const { mimirHaltRD } = useMimirHalt()

  return (
    <AssetsTableCollapsable
      chainBalances={chainBalances}
      pricePool={selectedPricePool}
      poolDetails={poolDetails}
      selectAssetHandler={selectAssetHandler}
      setSelectedAsset={setSelectedAsset}
      mimirHalt={mimirHaltRD}
      network={network}
    />
  )
}
