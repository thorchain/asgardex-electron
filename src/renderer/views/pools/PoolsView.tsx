import React from 'react'

import { Route, Switch } from 'react-router-dom'

import * as depositRoutes from '../../routes/deposit'
import * as poolsRoutes from '../../routes/pools'
import * as swapRoutes from '../../routes/swap'
import { DepositView } from '../deposit/DepositView'
import { SwapView } from '../swap/SwapView'
import { PoolsOverview } from './PoolsOverview'

export const PoolsView: React.FC = (): JSX.Element => {
  return (
    <Switch>
      <Route path={poolsRoutes.base.template} exact>
        <PoolsOverview />
      </Route>
      <Route path={swapRoutes.swap.template} exact>
        <SwapView />
      </Route>
      <Route path={depositRoutes.deposit.template} exact>
        <DepositView />
      </Route>
    </Switch>
  )
}
