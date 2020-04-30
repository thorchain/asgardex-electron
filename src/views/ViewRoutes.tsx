import React from 'react'
import { Route, Switch } from 'react-router-dom'
import SwapHomeView from './swap/SwapHomeView'
import StakeHomeView from './stake/StakeHomeView'
import NoContentView from './NoContentView'
import { swapHomeRoute, stakeHomeRoute, swapRoute, stakeRoute, walletHomeRoute } from '../routes'
import SwapView from './swap/SwapView'
import StakeView from './stake/StakeView'
import WalletHomeView from './wallet/WalletHomeView'

const ViewRoutes: React.FC<{}> = (): JSX.Element => {
  return (
    <Switch>
      <Route path={swapHomeRoute.template} exact>
        <SwapHomeView />
      </Route>
      <Route path={swapRoute.template} exact>
        <SwapView />
      </Route>
      <Route path={stakeHomeRoute.template} exact>
        <StakeHomeView />
      </Route>
      <Route path={stakeRoute.template} exact>
        <StakeView />
      </Route>
      <Route path={walletHomeRoute.template} exact>
        <WalletHomeView />
      </Route>
      <Route path="*">
        <NoContentView />
      </Route>
    </Switch>
  )
}

export default ViewRoutes
