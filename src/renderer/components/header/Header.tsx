import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'

import { getClientUrl } from '../../../shared/thorchain/client'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { useThorchainContext } from '../../contexts/ThorchainContext'
import { useWalletContext } from '../../contexts/WalletContext'
import { useNetwork } from '../../hooks/useNetwork'
import { usePricePools } from '../../hooks/usePricePools'
import { useRunePrice } from '../../hooks/useRunePrice'
import { useVolume24Price } from '../../hooks/useVolume24Price'
import { SelectedPricePoolAsset } from '../../services/midgard/types'
import { HeaderComponent } from './HeaderComponent'

export const Header: React.FC = (): JSX.Element => {
  const { keystoreService } = useWalletContext()
  const { mimir$ } = useThorchainContext()
  const { lock } = keystoreService
  const keystore = useObservableState(keystoreService.keystoreState$, O.none)
  const mimir = useObservableState(mimir$, RD.initial)
  const { service: midgardService } = useMidgardContext()
  const {
    pools: { setSelectedPricePoolAsset: setSelectedPricePool, selectedPricePoolAsset$, inboundAddressesShared$ },
    apiEndpoint$
  } = midgardService

  const { network } = useNetwork()

  const oSelectedPricePoolAsset = useObservableState<SelectedPricePoolAsset>(selectedPricePoolAsset$, O.none)

  const { runePriceRD, reloadRunePrice } = useRunePrice()
  const { volume24PriceRD, reloadVolume24Price } = useVolume24Price()

  const pricePools = usePricePools()

  const inboundAddresses = useObservableState(inboundAddressesShared$, RD.initial)

  const midgardUrlRD = useObservableState(apiEndpoint$, RD.initial)
  const thorchainUrl = getClientUrl()[network].node

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
      mimir={mimir}
      midgardUrl={midgardUrlRD}
      thorchainUrl={thorchainUrl}
    />
  )
}
