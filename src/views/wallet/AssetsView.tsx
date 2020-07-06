import React, { useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'

import AssetsTable from '../../components/wallet/AssetsTable'
import { useBinanceContext } from '../../contexts/BinanceContext'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { pricePoolSelectorFromRD } from '../../services/midgard/utils'
import { PoolAsset, PricePoolAsset } from '../pools/types'

const AssetsView: React.FC = (): JSX.Element => {
  const { balancesState$, reloadBalances } = useBinanceContext()
  const balancesRD = useObservableState(balancesState$, RD.initial)

  const {
    service: { poolsState$, selectedPricePoolAsset$ }
  } = useMidgardContext()
  const poolsRD = useObservableState(poolsState$, RD.pending)
  const selectedPricePoolAsset = useObservableState<O.Option<PricePoolAsset>>(
    selectedPricePoolAsset$,
    O.some(PoolAsset.RUNE)
  )

  const pricePool = useMemo(() => pricePoolSelectorFromRD(poolsRD, selectedPricePoolAsset), [
    poolsRD,
    selectedPricePoolAsset
  ])

  const poolDetails = RD.toNullable(poolsRD)?.poolDetails ?? []

  return (
    <AssetsTable
      balances={balancesRD}
      reloadBalancesHandler={reloadBalances}
      pricePool={pricePool}
      poolDetails={poolDetails}
    />
  )
}

export default AssetsView
