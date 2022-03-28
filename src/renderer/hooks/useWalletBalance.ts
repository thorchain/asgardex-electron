import * as RD from '@devexperts/remote-data-ts'
import { BaseAmount } from '@xchainjs/xchain-util'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { ZERO_BASE_AMOUNT } from '../const'
import { useMidgardContext } from '../contexts/MidgardContext'
import { useWalletContext } from '../contexts/WalletContext'
import { to1e8BaseAmount } from '../helpers/assetHelper'
import { sequenceTRD, sequenceTRDFromArray } from '../helpers/fpHelpers'
import { getPoolPriceValue } from '../helpers/poolHelper'
import { WalletBalance } from '../services/wallet/types'
import { BaseAmountRD } from '../types'
import { useNetwork } from './useNetwork'

export const useTotalWalletBalance = () => {
  const { chainBalances$ } = useWalletContext()

  const { network } = useNetwork()

  const {
    service: {
      pools: { poolsState$, selectedPricePool$ }
    }
  } = useMidgardContext()

  const [total] = useObservableState<BaseAmountRD>(
    () =>
      FP.pipe(
        Rx.combineLatest([chainBalances$, poolsState$, selectedPricePool$]),
        RxOp.map(([chainBalances, poolsStateRD, { poolData: pricePoolData }]) =>
          FP.pipe(
            chainBalances,
            // Get balances from `ChainBalance`
            A.map(({ balances }) => balances),
            // Get sequence of all balances
            (walletBalances) => sequenceTRDFromArray(walletBalances),
            // Transform error `ApiError` -> `Error`
            RD.mapLeft((apiError) => Error(`${apiError.msg} (errorId: ${apiError.errorId})`)),
            // Transform `WalletBalance[][]` -> `WalletBalance[]`
            RD.map(A.flatten),
            // Sequence RD of balance + poolstate
            (balancesRD) => sequenceTRD(balancesRD, poolsStateRD),
            RD.map(([balances, { poolDetails }]) =>
              FP.pipe(
                balances,
                // sum all balances
                A.reduce<WalletBalance, BaseAmount>(ZERO_BASE_AMOUNT, (acc, currBalance) => {
                  return FP.pipe(
                    getPoolPriceValue({ balance: currBalance, poolDetails, pricePoolData, network }),
                    O.getOrElse(() => ZERO_BASE_AMOUNT),
                    // Before sum, all amounts needs to have same decimal - `1e8` in this case
                    to1e8BaseAmount,
                    acc.plus
                  )
                })
              )
            )
          )
        )
      ),
    RD.initial
  )

  return { total }
}
