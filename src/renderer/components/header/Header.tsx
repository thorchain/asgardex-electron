import React, { useEffect, useCallback } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useHistory, useRouteMatch } from 'react-router'

import { Network } from '../../../shared/api/types'
import { useAppContext } from '../../contexts/AppContext'
import { useBinanceContext } from '../../contexts/BinanceContext'
import { useBitcoinContext } from '../../contexts/BitcoinContext'
import { useI18nContext } from '../../contexts/I18nContext'
import { useLitecoinContext } from '../../contexts/LitecoinContext'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { useThorchainContext } from '../../contexts/ThorchainContext'
import { useWalletContext } from '../../contexts/WalletContext'
import * as poolsRoutes from '../../routes/pools'
import * as walletRoutes from '../../routes/wallet'
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

  const { explorerUrl$: binanceUrl$ } = useBinanceContext()
  const binanceUrl = useObservableState(binanceUrl$, O.none)

  const { explorerUrl$: bitcoinUrl$ } = useBitcoinContext()
  const bitcoinUrl = useObservableState(bitcoinUrl$, O.none)

  const { explorerUrl$: thorchainUrl$ } = useThorchainContext()
  const thorchainUrl = useObservableState(thorchainUrl$, O.none)

  const litecoinUrl$ = useLitecoinContext().explorerUrl$
  const litecoinUrl = useObservableState(litecoinUrl$, O.none)

  const { changeLocale, locale$, initialLocale } = useI18nContext()
  const currentLocale = useObservableState(locale$, initialLocale)

  const history = useHistory()

  // Check pool sub-routes and return url to re-direct in case of matching
  const oPoolRedirectPath: O.Option<string> = FP.pipe(
    useRouteMatch([poolsRoutes.deposit.template, poolsRoutes.detail.template, poolsRoutes.swap.template]),
    O.fromNullable,
    O.map((_) => poolsRoutes.base.path())
  )

  // Check wallet sub-routes and return url to re-direct in case of matching
  const oWalletRedirectPath: O.Option<string> = FP.pipe(
    useRouteMatch([
      walletRoutes.send.template,
      walletRoutes.upgradeBnbRune.template,
      walletRoutes.assetDetail.template,
      walletRoutes.bonds.template,
      walletRoutes.deposit.template
    ]),
    O.fromNullable,
    O.map((_) => walletRoutes.base.path())
  )

  /**
   * By switching network, we have to re-direct to a top level routes in following cases:
   * (1) Sub-routes of pools are redirected to the top-level route, since we don't have same pools on different networks
   * (2) Some (not all) sub-routes
   *
   * You might have following questions:
   *
   * (1) Why not handling this at service layer?
   * --------------------------------------------
   * We can't handle this at service layer, because it's recommended by React Router to handle route states on view layer only.
   * Quote: "Our recommendation is not to keep your routes in your Redux store at all."
   * ^ @see https://reactrouter.com/web/guides/deep-redux-integration
   *
   * (2) Why don't  we handle re-directing in views, where we defined our routes (such as `PoolsView` or `WalletView`)?
   * ------------------------------------------------------------------------------------------------------------------
   * Since we have to subscribe to `network$` to get changes by using `useSubscription` or something,
   * we get state of network after first rendering, but not before. With this, components are still trying to render data,
   * which might be deprecated based on network changes.
   *
   */
  const changeNetworkHandler = useCallback(
    (network: Network) => {
      changeNetwork(network)

      const M = O.getFirstMonoid<string>()
      // Handle first "some" value within a list of possible urls to re-direct
      FP.pipe(M.concat(oPoolRedirectPath, oWalletRedirectPath), O.map(history.replace))
    },
    [changeNetwork, history.replace, oPoolRedirectPath, oWalletRedirectPath]
  )

  useEffect(() => {
    // Required to update the electron native menu according to the selected locale
    window.apiLang.update(currentLocale)
  }, [currentLocale])

  return (
    <HeaderComponent
      selectedNetwork={network}
      changeNetwork={changeNetworkHandler}
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
