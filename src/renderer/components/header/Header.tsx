import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'

import { useBinanceContext } from '../../contexts/BinanceContext'
import { useBitcoinCashContext } from '../../contexts/BitcoinCashContext'
import { useBitcoinContext } from '../../contexts/BitcoinContext'
import { useEthereumContext } from '../../contexts/EthereumContext'
import { useLitecoinContext } from '../../contexts/LitecoinContext'
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
  const { lock } = keystoreService
  const keystore = useObservableState(keystoreService.keystore$, O.none)
  const { service: midgardService } = useMidgardContext()
  const {
    pools: { setSelectedPricePoolAsset: setSelectedPricePool, selectedPricePoolAsset$ },
    apiEndpoint$
  } = midgardService

  const { network } = useNetwork()

  const oSelectedPricePoolAsset = useObservableState<SelectedPricePoolAsset>(selectedPricePoolAsset$, O.none)

  const { runePriceRD, reloadRunePrice } = useRunePrice()
  const { volume24PriceRD, reloadVolume24Price } = useVolume24Price()

  const pricePools = usePricePools()

  const midgardUrl = useObservableState(apiEndpoint$, RD.initial)

  const { explorerUrl$: binanceUrl$ } = useBinanceContext()
  const binanceUrl = useObservableState(binanceUrl$, O.none)

  const { explorerUrl$: bitcoinUrl$ } = useBitcoinContext()
  const bitcoinUrl = useObservableState(bitcoinUrl$, O.none)

  const { explorerUrl$: thorchainUrl$ } = useThorchainContext()
  const thorchainUrl = useObservableState(thorchainUrl$, O.none)

  const { explorerUrl$: ethereumUrl$ } = useEthereumContext()
  const ethereumUrl = useObservableState(ethereumUrl$, O.none)

  const { explorerUrl$: bitcoinCashUrl$ } = useBitcoinCashContext()
  const bitcoinCashUrl = useObservableState(bitcoinCashUrl$, O.none)

  const litecoinUrl$ = useLitecoinContext().explorerUrl$
  const litecoinUrl = useObservableState(litecoinUrl$, O.none)

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
      binanceUrl={binanceUrl}
      bitcoinUrl={bitcoinUrl}
      litecoinUrl={litecoinUrl}
      thorchainUrl={thorchainUrl}
      ethereumUrl={ethereumUrl}
      bitcoinCashUrl={bitcoinCashUrl}
      midgardUrl={RD.toOption(midgardUrl)}
    />
  )
}
