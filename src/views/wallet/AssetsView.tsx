import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { useObservableState } from 'observable-hooks'

import AssetsTable from '../../components/wallet/AssetsTable'
import { useBinanceContext } from '../../contexts/BinanceContext'

const AssetsView: React.FC = (): JSX.Element => {
  const { balancesState$, reloadBalances } = useBinanceContext()
  const balancesRD = useObservableState(balancesState$, RD.initial)

  return <AssetsTable balances={balancesRD} reloadBalancesHandler={reloadBalances} />
}

export default AssetsView
