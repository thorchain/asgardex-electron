import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'

import { useBinanceContext } from '../../contexts/BinanceContext'
import { useBitcoinContext } from '../../contexts/BitcoinContext'
import { useI18nContext } from '../../contexts/I18nContext'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { useThorchainContext } from '../../contexts/ThorchainContext'
import { useWalletContext } from '../../contexts/WalletContext'
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
  const midgardUrl = useObservableState(apiEndpoint$, RD.initial)

  const binanceUrl$ = useBinanceContext().explorerUrl$
  const binanceUrl = useObservableState(binanceUrl$, O.none)

  const bitcoinUrl$ = useBitcoinContext().explorerUrl$
  const bitcoinUrl = useObservableState(bitcoinUrl$, O.none)

  const thorchainUrl$ = useThorchainContext().explorerUrl$
  const thorchainUrl = useObservableState(thorchainUrl$, O.none)

  const { changeLocale, locale$, initialLocale } = useI18nContext()
  const currentLocale = useObservableState(locale$, initialLocale)

  return (
    <HeaderComponent
      keystore={keystore}
      lockHandler={lock}
      poolsState$={poolsState$}
      setSelectedPricePool={setSelectedPricePool}
      selectedPricePoolAsset$={selectedPricePoolAsset$}
      locale={currentLocale}
      changeLocale={changeLocale}
      binanceUrl={binanceUrl}
      bitcoinUrl={bitcoinUrl}
      thorchainUrl={thorchainUrl}
      midgardUrl={RD.toOption(midgardUrl)}
    />
  )
}
