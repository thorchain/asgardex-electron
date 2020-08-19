import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'

import { useBinanceContext } from '../../contexts/BinanceContext'
import { useI18nContext } from '../../contexts/I18nContext'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { useWalletContext } from '../../contexts/WalletContext'
import { initialLocale } from '../../services/i18n/service'
import HeaderComponent from './HeaderComponent'

const Header: React.FC = (): JSX.Element => {
  const { keystoreService } = useWalletContext()
  const { lock } = keystoreService
  const keystore = useObservableState(keystoreService.keystore$, O.none)
  const { service: midgardService } = useMidgardContext()
  const { poolsState$, setSelectedPricePool, selectedPricePoolAsset$, apiEndpoint$ } = midgardService
  const midgardUrl = useObservableState(apiEndpoint$, RD.initial)

  const { explorerUrl$ } = useBinanceContext()
  const explorerUrl = useObservableState(explorerUrl$, O.none)

  const { changeLocale, locale$ } = useI18nContext()
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
      binanceUrl={explorerUrl}
      midgardUrl={RD.toOption(midgardUrl)}
    />
  )
}

export default Header
