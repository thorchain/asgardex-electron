import React from 'react'

import { Route, Switch, Redirect } from 'react-router-dom'

import * as appRoutes from '../routes/app'
import * as playgroundRoutes from '../routes/playground'
import * as poolsRoutes from '../routes/pools'
import * as walletRoutes from '../routes/wallet'
import { AppSettingsView } from './app/AppSettingsView'
import { NoContentView } from './NoContentView'
import { PlaygroundView } from './playground/PlaygroundView'
import { PoolsView } from './pools/PoolsView'
import { WalletView } from './wallet/WalletView'

export const ViewRoutes: React.FC<{}> = (): JSX.Element => {
  return (
    <Switch>
      <Route path={appRoutes.base.path()} exact>
        <Redirect to={poolsRoutes.base.path()} />
      </Route>
      <Route path={poolsRoutes.base.template}>
        <PoolsView />
      </Route>
      <Route path={walletRoutes.base.template}>
        <WalletView />
      </Route>
      <Route path={appRoutes.settings.template}>
        <AppSettingsView />
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
