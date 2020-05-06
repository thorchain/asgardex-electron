import React from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import SwapHomeView from './swap/SwapHomeView'
import StakeHomeView from './stake/StakeHomeView'
import NoContentView from './NoContentView'
import { swapHomeRoute, stakeHomeRoute, swapRoute, stakeRoute, walletBaseRoute, homeRoute } from '../routes'
import SwapView from './swap/SwapView'
import StakeView from './stake/StakeView'
import WalletView from './wallet/WalletView'

const ViewRoutes: React.FC<{}> = (): JSX.Element => {
  return (
    <Switch>
      <Route path={homeRoute.path()} exact>
        <Redirect to={swapHomeRoute.path()} />
      </Route>
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
      <Route path={walletBaseRoute.template}>
        <WalletView />
      </Route>
      <Route path="*">
        <NoContentView />
      </Route>
    </Switch>
  )
}

export default ViewRoutes
