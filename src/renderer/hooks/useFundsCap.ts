import * as RD from '@devexperts/remote-data-ts'
import { assetAmount, assetToBase, baseAmount, BaseAmount, bn } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { useMidgardContext } from '../contexts/MidgardContext'
import { useThorchainContext } from '../contexts/ThorchainContext'
import { THORCHAIN_DECIMAL } from '../helpers/assetHelper'
import { sequenceTRD } from '../helpers/fpHelpers'
import { liveData } from '../helpers/rx/liveData'

export const LIQUIDITY_RUNE_BUFFER: BaseAmount = assetToBase(assetAmount('100000', THORCHAIN_DECIMAL)) // 100k

export type FundsCap = {
  reached: boolean
  pooledRuneAmount: BaseAmount
  maxPooledRuneAmount: BaseAmount
}

export type FundsCapRD = RD.RemoteData<Error, O.Option<FundsCap>>

/**
 * Hook to get Funds cap data
 *
 * Note: Same rule as we have for services - Use this hook in top level *views only (but not for components)
 */
export const useFundsCap = (): { data: FundsCapRD; reload: FP.Lazy<void> } => {
  const {
    service: { networkInfo$, reloadNetworkInfo }
  } = useMidgardContext()

  const { mimir$, reloadMimir } = useThorchainContext()

  const [data] = useObservableState<FundsCapRD>(
    () =>
      Rx.combineLatest([mimir$, networkInfo$]).pipe(
        RxOp.map(([mimirRD, networkInfoRD]) => sequenceTRD(mimirRD, networkInfoRD)),
        liveData.map(([mimir, { totalPooledRune }]) =>
          // TODO (@Veado) Extract logic into a helper function + test it
          FP.pipe(
            mimir.MAXIMUMLIQUIDITYRUNE,
            O.fromNullable,
            O.map(bn),
            O.map((maxLiquidityRuneBN) => {
              const reached = maxLiquidityRuneBN
                .minus(LIQUIDITY_RUNE_BUFFER.amount())
                .isLessThanOrEqualTo(bn(totalPooledRune))
              return {
                reached,
                pooledRuneAmount: baseAmount(totalPooledRune, THORCHAIN_DECIMAL),
                maxPooledRuneAmount: baseAmount(maxLiquidityRuneBN, THORCHAIN_DECIMAL)
              }
            })
          )
        ),
        RxOp.shareReplay(1)
      ),
    RD.initial
  )

  const reload: FP.Lazy<void> = () => {
    reloadMimir()
    reloadNetworkInfo()
  }

  return { data, reload }
}
