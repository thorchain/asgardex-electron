import * as RD from '@devexperts/remote-data-ts'
import { getValueOfRuneInAsset } from '@thorchain/asgardex-util'
// import { LiquidityHistoryIntervals, SwapHistoryIntervals } from '@xchainjs/xchain-midgard'
import { baseAmount, bnOrZero } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import { useObservableState } from 'observable-hooks'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { useMidgardContext } from '../contexts/MidgardContext'
import { sequenceTRD } from '../helpers/fpHelpers'
import { triggerStream } from '../helpers/stateHelper'
import { PriceRD } from '../services/midgard/types'
import { AssetWithAmount } from '../types/asgardex'

const { stream$: reloadHistory$, trigger: reloadHistory } = triggerStream()

export const useVolume24Price = () => {
  const {
    service: {
      pools: { poolsState$, selectedPricePool$, apiGetSwapHistory$, apiGetLiquidityHistory$, reloadPools }
    }
  } = useMidgardContext()

  const swapHistory$ = () =>
    FP.pipe(
      reloadHistory$,
      RxOp.switchMap((_) => apiGetSwapHistory$({ interval: 'Day', count: 2 }))
    )

  const liquidityHistory$ = () =>
    FP.pipe(
      reloadHistory$,
      RxOp.switchMap((_) => apiGetLiquidityHistory$({ interval: 'Day', count: 2 }))
    )

  const reloadVolume24Price = () => {
    // reload of pools are needed to calculate prices properly
    reloadPools()
    reloadHistory()
  }

  const [volume24PriceRD] = useObservableState<PriceRD>(
    () =>
      FP.pipe(
        Rx.combineLatest([swapHistory$(), liquidityHistory$(), poolsState$, selectedPricePool$]),
        RxOp.map(
          ([
            swapHistoryRD,
            liquidityHistoryRD,
            poolStateRD,
            { poolData: selectedPricePoolData, asset: pricePoolAsset }
          ]) =>
            FP.pipe(
              sequenceTRD(swapHistoryRD, liquidityHistoryRD, poolStateRD),
              RD.map(([{ intervals: swapIntervals }, { intervals: liquidityIntervals }, _]) => {
                const swapVol = baseAmount(bnOrZero(swapIntervals[0]?.totalVolume))
                const liquitidyVol = baseAmount(bnOrZero(liquidityIntervals[0]?.addLiquidityVolume))
                const withdrawVol = baseAmount(bnOrZero(liquidityIntervals[0]?.withdrawVolume))
                const volume24 = swapVol.plus(liquitidyVol).plus(withdrawVol)

                const volume24Price: AssetWithAmount = {
                  asset: pricePoolAsset,
                  amount: getValueOfRuneInAsset(volume24, selectedPricePoolData)
                }

                return volume24Price
              })
            )
        )
      ),
    RD.initial
  )

  return { volume24PriceRD, reloadVolume24Price }
}
