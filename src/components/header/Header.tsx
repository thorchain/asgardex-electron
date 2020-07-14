import React from 'react'

import { none } from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'

import { useI18nContext } from '../../contexts/I18nContext'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { useWalletContext } from '../../contexts/WalletContext'
import { initialLocale } from '../../services/i18n/service'
import HeaderComponent from './HeaderComponent'

const Header: React.FC = (): JSX.Element => {
  const { keystoreService } = useWalletContext()
  const { lock } = keystoreService
  const keystore = useObservableState(keystoreService.keystore$, none)
  const { service: midgardService } = useMidgardContext()
  const { poolsState$, setSelectedPricePool, selectedPricePoolAsset$ } = midgardService

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
    />
  )
}

export default Header
