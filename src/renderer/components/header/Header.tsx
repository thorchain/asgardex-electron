import React, { useEffect } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'

import { Network } from '../../../shared/api/types'
import { useAppContext } from '../../contexts/AppContext'
import { useBinanceContext } from '../../contexts/BinanceContext'
import { useBitcoinContext } from '../../contexts/BitcoinContext'
import { useI18nContext } from '../../contexts/I18nContext'
import { useLitecoinContext } from '../../contexts/LitecoinContext'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { useThorchainContext } from '../../contexts/ThorchainContext'
import { useWalletContext } from '../../contexts/WalletContext'
import { DEFAULT_NETWORK } from '../../services/const'
import { HeaderComponent } from './HeaderComponent'

export const Header: React.FC = (): JSX.Element => {
  const { keystoreService } = useWalletContext()
  const { lock } = keystoreService
  const keystore = useObservableState(keystoreService.keystore$, O.none)
  const { service: midgardService } = useMidgardContext()
  const {
    pools: { poolsState$, setSelectedPricePoolAsset: setSelectedPricePool, selectedPricePoolAsset$ },
    apiEndpoint$
  } = midgardService

  const { network$, changeNetwork } = useAppContext()

  const network = useObservableState<Network>(network$, DEFAULT_NETWORK)

  const midgardUrl = useObservableState(apiEndpoint$, RD.initial)

  const binanceUrl$ = useBinanceContext().explorerUrl$
  const binanceUrl = useObservableState(binanceUrl$, O.none)

  const bitcoinUrl$ = useBitcoinContext().explorerUrl$
  const bitcoinUrl = useObservableState(bitcoinUrl$, O.none)

  const thorchainUrl$ = useThorchainContext().explorerUrl$
  const thorchainUrl = useObservableState(thorchainUrl$, O.none)

  const litecoinUrl$ = useLitecoinContext().explorerUrl$
  const litecoinUrl = useObservableState(litecoinUrl$, O.none)

  const { changeLocale, locale$, initialLocale } = useI18nContext()
  const currentLocale = useObservableState(locale$, initialLocale)

  useEffect(() => {
    // Required to update the electron native menu according to the selected locale
    window.apiLang.update(currentLocale)
  }, [currentLocale])

  return (
    <HeaderComponent
      selectedNetwork={network}
      changeNetwork={changeNetwork}
      keystore={keystore}
      lockHandler={lock}
      poolsState$={poolsState$}
      setSelectedPricePool={setSelectedPricePool}
      selectedPricePoolAsset$={selectedPricePoolAsset$}
      locale={currentLocale}
      changeLocale={changeLocale}
      binanceUrl={binanceUrl}
      bitcoinUrl={bitcoinUrl}
      litecoinUrl={litecoinUrl}
      thorchainUrl={thorchainUrl}
      midgardUrl={RD.toOption(midgardUrl)}
    />
  )
}
