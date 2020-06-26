import React from 'react'

import { none } from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'

import { useMidgardContext } from '../../contexts/MidgardContext'
import { useWalletContext } from '../../contexts/WalletContext'
import HeaderComponent from './HeaderComponent'

const Header: React.FC = (): JSX.Element => {
  const { keystoreService } = useWalletContext()
  const { lock } = keystoreService
  const keystore = useObservableState(keystoreService.keystore$, none)
  const { service: midgardService } = useMidgardContext()
  const { poolsState$, setSelectedPricePool, selectedPricePoolAsset$ } = midgardService

  return (
    <HeaderComponent
      keystore={keystore}
      lockHandler={lock}
      poolsState$={poolsState$}
      setSelectedPricePool={setSelectedPricePool}
      selectedPricePoolAsset$={selectedPricePoolAsset$}
    />
  )
}

export default Header
