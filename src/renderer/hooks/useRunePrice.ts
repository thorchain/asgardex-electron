import * as RD from '@devexperts/remote-data-ts'
import { getValueOfRuneInAsset } from '@thorchain/asgardex-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { ONE_RUNE_BASE_AMOUNT } from '../../shared/mock/amount'
import { useMidgardContext } from '../contexts/MidgardContext'
import { sequenceTOption } from '../helpers/fpHelpers'
import { PriceRD } from '../services/midgard/types'
import { pricePoolSelector } from '../services/midgard/utils'

export const useRunePrice = () => {
  const {
    service: {
      pools: { poolsState$, selectedPricePoolAsset$, reloadPools }
    }
  } = useMidgardContext()

  const reloadRunePrice = () => {
    // reload pools triggers changes of poolsState$, with it changes of `runePriceRD`
    reloadPools()
  }

  const [runePriceRD] = useObservableState<PriceRD>(
    () =>
      Rx.combineLatest([poolsState$, selectedPricePoolAsset$]).pipe(
        RxOp.map(([poolsState, oSelectedPricePoolAsset]) =>
          FP.pipe(
            poolsState,
            RD.chain(({ pricePools: oPricePools }) =>
              FP.pipe(
                sequenceTOption(oPricePools, oSelectedPricePoolAsset),
                O.map(([pricePools, pricePoolAsset]) => {
                  const { poolData } = pricePoolSelector(pricePools, O.some(pricePoolAsset))
                  return {
                    asset: pricePoolAsset,
                    amount: getValueOfRuneInAsset(ONE_RUNE_BASE_AMOUNT, poolData)
                  }
                }),
                (oRunePrice) =>
                  RD.fromOption(oRunePrice, () => Error('Could not get price for RUNE from selected price pool'))
              )
            )
          )
        )
      ),
    RD.initial
  )

  return { runePriceRD, reloadRunePrice }
}
