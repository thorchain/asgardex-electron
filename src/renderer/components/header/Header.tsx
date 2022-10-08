import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'

import { useMidgardContext } from '../../contexts/MidgardContext'
import { useThorchainContext } from '../../contexts/ThorchainContext'
import { liveData } from '../../helpers/rx/liveData'
import { useKeystoreState } from '../../hooks/useKeystoreState'
import { useKeystoreWallets } from '../../hooks/useKeystoreWallets'
import { useNetwork } from '../../hooks/useNetwork'
import { usePricePools } from '../../hooks/usePricePools'
import { useRunePrice } from '../../hooks/useRunePrice'
import { useThorchainClientUrl } from '../../hooks/useThorchainClientUrl'
import { useVolume24Price } from '../../hooks/useVolume24Price'
import { SelectedPricePoolAsset } from '../../services/midgard/types'
import { HeaderComponent } from './HeaderComponent'

export const Header: React.FC = (): JSX.Element => {
  const { lock, state: keystoreState, change$: changeWalletHandler$ } = useKeystoreState()
  const { walletsUI } = useKeystoreWallets()
  const { mimir$ } = useThorchainContext()
  const mimir = useObservableState(mimir$, RD.initial)
  const { service: midgardService } = useMidgardContext()
  const {
    pools: { setSelectedPricePoolAsset: setSelectedPricePool, selectedPricePoolAsset$ },
    apiEndpoint$,
    thorchainLastblockState$
  } = midgardService

  const { network } = useNetwork()

  const oSelectedPricePoolAsset = useObservableState<SelectedPricePoolAsset>(selectedPricePoolAsset$, O.none)

  const { runePriceRD, reloadRunePrice } = useRunePrice()
  const { volume24PriceRD, reloadVolume24Price } = useVolume24Price()

  const pricePools = usePricePools()

  /**
   * Midgard status is currently based on requests to check last block
   * This request happens on a regular basis and give us a feedback whether Midgard is available
   *
   * TODO(@veado) Use Midgards `health` endpoint to get a better status
   */
  const [midgardStatusRD] = useObservableState(
    () =>
      FP.pipe(
        thorchainLastblockState$,
        liveData.map((_) => true)
      ),
    RD.initial
  )

  const midgardUrlRD = useObservableState(apiEndpoint$, RD.initial)
  const { node: thorchainNodeUrl, rpc: thorchainRpcUrl } = useThorchainClientUrl()

  return (
    <HeaderComponent
      network={network}
      keystore={keystoreState}
      wallets={walletsUI}
      lockHandler={lock}
      changeWalletHandler$={changeWalletHandler$}
      pricePools={pricePools}
      setSelectedPricePool={setSelectedPricePool}
      runePrice={runePriceRD}
      reloadRunePrice={reloadRunePrice}
      volume24Price={volume24PriceRD}
      reloadVolume24Price={reloadVolume24Price}
      selectedPricePoolAsset={oSelectedPricePoolAsset}
      midgardStatus={midgardStatusRD}
      mimir={mimir}
      midgardUrl={midgardUrlRD}
      thorchainNodeUrl={thorchainNodeUrl}
      thorchainRpcUrl={thorchainRpcUrl}
    />
  )
}
