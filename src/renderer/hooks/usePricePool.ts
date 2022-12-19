import { useObservableState } from 'observable-hooks'

import { useMidgardContext } from '../contexts/MidgardContext'
import { RUNE_PRICE_POOL } from '../helpers/poolHelper'

export type UsePricePoolsResult = ReturnType<typeof usePricePool>

export const usePricePool = () => {
  const {
    service: {
      pools: { selectedPricePool$ }
    }
  } = useMidgardContext()

  const pricePool = useObservableState(selectedPricePool$, RUNE_PRICE_POOL)

  return pricePool
}
