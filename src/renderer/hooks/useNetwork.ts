import { useCallback } from 'react'

import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useHistory, useRouteMatch } from 'react-router-dom'

import { Network } from '../../shared/api/types'
import { useAppContext } from '../contexts/AppContext'
import * as poolsRoutes from '../routes/pools'
import * as walletRoutes from '../routes/wallet'
import { ChangeNetworkHandler } from '../services/app/types'
import { DEFAULT_NETWORK } from '../services/const'

/**
 * Hook to get network data
 *
 * Note: Same rule as we have for services - Use this hook in top level *views only (but not for components)
 */
export const useNetwork = (): { network: Network; changeNetwork: ChangeNetworkHandler } => {
  const { network$, changeNetwork } = useAppContext()

  const network = useObservableState<Network>(network$, DEFAULT_NETWORK)

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
      walletRoutes.upgradeRune.template,
      walletRoutes.assetDetail.template,
      walletRoutes.bonds.template,
      walletRoutes.interact.template
    ]),
    O.fromNullable,
    O.map((_) => walletRoutes.base.path())
  )

  /**
   * By switching the network, we have to re-direct to a top level route in following scenarios:
   * (1) Sub-routes of pools are redirected to the top-level route, since we don't have same pools on different networks
   * (2) Some (not all) sub-routes
   *
   * You might have following questions:
   *
   * (1) Why not handling this at service layer?
   * --------------------------------------------
   * We can't handle this at service layer, because it's recommended by React Router
   * to handle route states on view layer only. And `useNetwork` is used at view layer only.
   * Quote: "Our recommendation is not to keep your routes in your Redux store at all."
   * ^ @see https://reactrouter.com/web/guides/deep-redux-integration
   *
   * (2) Why don't we handle re-directing in views, where we defined our routes (such as `PoolsView` or `WalletView`)?
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

  return { network, changeNetwork: changeNetworkHandler }
}
