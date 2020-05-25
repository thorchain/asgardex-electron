import React from 'react'

import { Route, Switch, Redirect } from 'react-router-dom'

import * as appRoutes from '../routes/app'
import * as playgroundRoutes from '../routes/playground'
import * as stakeRoutes from '../routes/stake'
import * as swapRoutes from '../routes/swap'
import * as walletRoutes from '../routes/wallet'
import NoContentView from './NoContentView'
import PlaygroundView from './playground/PlaygroundView'
import StakeHomeView from './stake/StakeHomeView'
import StakeView from './stake/StakeView'
import SwapHomeView from './swap/SwapHomeView'
import SwapView from './swap/SwapView'
import WalletView from './wallet/WalletView'

const ViewRoutes: React.FC<{}> = (): JSX.Element => {
  return (
    <Switch>
      <Route path={appRoutes.base.path()} exact>
        <Redirect to={swapRoutes.base.path()} />
      </Route>
      <Route path={swapRoutes.base.template} exact>
        <SwapHomeView />
      </Route>
      <Route path={swapRoutes.swap.template} exact>
        <SwapView />
      </Route>
      <Route path={stakeRoutes.base.template} exact>
        <StakeHomeView />
      </Route>
      <Route path={stakeRoutes.asset.template} exact>
        <StakeView />
      </Route>
      <Route path={walletRoutes.base.template}>
        <WalletView />
      </Route>
      <Route path={playgroundRoutes.base.template}>
        <PlaygroundView />
      </Route>
      <Route path="*">
        <NoContentView />
      </Route>
    </Switch>
  )
}

export default ViewRoutes
