import React from 'react'

import { Route, Switch } from 'react-router-dom'

import * as poolsRoutes from '../../routes/pools'
import { DepositView } from '../deposit/DepositView'
import { PoolDetailsView } from '../pool/PoolDetailsView'
import { SwapView } from '../swap/SwapView'
import { PoolsOverview } from './PoolsOverview'

export const PoolsView: React.FC = (): JSX.Element => {
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
