import React from 'react'

import { Route, Switch } from 'react-router-dom'

import * as poolsRoutes from '../../routes/pools'
import * as stakeRoutes from '../../routes/stake'
import * as swapRoutes from '../../routes/swap'
import { StakeView } from '../stake/StakeView'
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
      <Route path={stakeRoutes.stake.template} exact>
        <StakeView />
      </Route>
    </Switch>
  )
}
