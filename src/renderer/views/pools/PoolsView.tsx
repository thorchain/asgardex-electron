import React from 'react'

import { useSubscription } from 'observable-hooks'
import { Route, Switch, useHistory } from 'react-router-dom'

import { useAppContext } from '../../contexts/AppContext'
import * as poolsRoutes from '../../routes/pools'
import { DepositView } from '../deposit/DepositView'
import { PoolDetailsView } from '../pool/PoolDetailsView'
import { SwapView } from '../swap/SwapView'
import { PoolsOverview } from './PoolsOverview'

export const PoolsView: React.FC = (): JSX.Element => {
  const { network$ } = useAppContext()
  const history = useHistory()

  /**
   * All of inner routes are Pool dependent.
   * After network switched there might be
   * a situation when there is no such pool
   * as previously selected for previous network.
   * For this reason for every network change
   * we redirect to the top-level route
   */
  useSubscription(network$, () => {
    history.replace(poolsRoutes.base.path())
  })

  return (
    <Switch>
      <Route path={poolsRoutes.base.template} exact>
        <PoolsOverview />
      </Route>
      <Route path={poolsRoutes.swap.template} exact>
        <SwapView />
      </Route>
      <Route path={poolsRoutes.deposit.template} exact>
        <DepositView />
      </Route>
      <Route path={poolsRoutes.detail.template} exact>
        <PoolDetailsView />
      </Route>
    </Switch>
  )
}
