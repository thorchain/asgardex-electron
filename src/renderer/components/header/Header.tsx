import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'

import { useMidgardContext } from '../../contexts/MidgardContext'
import { useWalletContext } from '../../contexts/WalletContext'
import { useMimirHalt } from '../../hooks/useMimirHalt'
import { useNetwork } from '../../hooks/useNetwork'
import { usePricePools } from '../../hooks/usePricePools'
import { useRunePrice } from '../../hooks/useRunePrice'
import { useVolume24Price } from '../../hooks/useVolume24Price'
import { SelectedPricePoolAsset } from '../../services/midgard/types'
import { HeaderComponent } from './HeaderComponent'

export const Header: React.FC = (): JSX.Element => {
  const { keystoreService } = useWalletContext()
  const { mimirHaltRD } = useMimirHalt()
  const { lock } = keystoreService
  const keystore = useObservableState(keystoreService.keystore$, O.none)
  const { service: midgardService } = useMidgardContext()
  const {
    pools: { setSelectedPricePoolAsset: setSelectedPricePool, selectedPricePoolAsset$, inboundAddressesShared$ }
  } = midgardService

  const { network } = useNetwork()

  const oSelectedPricePoolAsset = useObservableState<SelectedPricePoolAsset>(selectedPricePoolAsset$, O.none)

  const { runePriceRD, reloadRunePrice } = useRunePrice()
  const { volume24PriceRD, reloadVolume24Price } = useVolume24Price()

  const pricePools = usePricePools()

  const inboundAddresses = useObservableState(inboundAddressesShared$, RD.initial)

  return (
    <HeaderComponent
      network={network}
      keystore={keystore}
      lockHandler={lock}
      pricePools={pricePools}
      setSelectedPricePool={setSelectedPricePool}
      runePrice={runePriceRD}
      reloadRunePrice={reloadRunePrice}
      volume24Price={volume24PriceRD}
      reloadVolume24Price={reloadVolume24Price}
      selectedPricePoolAsset={oSelectedPricePoolAsset}
      inboundAddresses={inboundAddresses}
      mimirHalt={mimirHaltRD}
    />
  )
}
