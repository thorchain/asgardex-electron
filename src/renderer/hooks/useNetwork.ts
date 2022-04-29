import { useCallback } from 'react'

import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useNavigate, matchPath, useLocation } from 'react-router-dom'

import { Network } from '../../shared/api/types'
import { useAppContext } from '../contexts/AppContext'
import * as poolsRoutes from '../routes/pools'
import * as walletRoutes from '../routes/wallet'
import { ChangeNetworkHandler } from '../services/app/types'
import { DEFAULT_NETWORK } from '../services/const'

// TODO (@veado)
// 1. Extract into helper/routes + test
// 2. Extract changeNetworkHandler into App (not needed to have this in this hook)
const matchPaths = (pathes: string[], pathname: string): O.Option<string> =>
  FP.pipe(
    pathes,
    A.map((path) => matchPath(path, pathname)),
    A.map(O.fromNullable),
    // filter `None` out from list
    A.filterMap(FP.identity),
    A.map(({ pathnameBase }) => pathnameBase),
    A.head,
    O.map((_) => poolsRoutes.base.path())
  )

/**
 * Hook to get network data
 *
 * Note: Same rule as we have for services - Use this hook in top level *views only (but not for components)
 */
export const useNetwork = (): { network: Network; changeNetwork: ChangeNetworkHandler } => {
  const { network$, changeNetwork } = useAppContext()

  const network = useObservableState<Network>(network$, DEFAULT_NETWORK)

  const { pathname } = useLocation()

  const navigate = useNavigate()

  // Check pool sub-routes and return url to re-direct in case of matching
  const oPoolRedirectPath: O.Option<string> = matchPaths(
    [poolsRoutes.deposit.template, poolsRoutes.detail.template, poolsRoutes.swap.template],
    pathname
  )

  // Check wallet sub-routes and return url to re-direct in case of matching
  const oWalletRedirectPath: O.Option<string> = matchPaths(
    [
      walletRoutes.send.template,
      walletRoutes.upgradeRune.template,
      walletRoutes.assetDetail.template,
      walletRoutes.bonds.template,
      walletRoutes.history.template,
      walletRoutes.poolShares.template,
      walletRoutes.interact.template
    ],
    pathname
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
   * (2) Why don't we handle re-directing in views, where we defined our routes?
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
      FP.pipe(
        M.concat(oPoolRedirectPath, oWalletRedirectPath),
        O.map((path) => navigate(path, { replace: true }))
      )
    },
    [changeNetwork, navigate, oPoolRedirectPath, oWalletRedirectPath]
  )

  return { network, changeNetwork: changeNetworkHandler }
}
