import React, { useCallback, useMemo } from 'react'

import * as H from 'history'
import { useObservableState } from 'observable-hooks'
import { Switch, Route, Redirect } from 'react-router-dom'

import AssetsNav from '../../components/wallet/AssetsNav'
import { useWalletContext } from '../../contexts/WalletContext'
import { RedirectRouteState } from '../../routes/types'
import * as walletRoutes from '../../routes/wallet'
import { hasImportedKeystore, isLocked } from '../../services/wallet/util'
import View from '../View'
import AssetDetailsView from './AssetDetailsView'
import AssetsView from './AssetsView'
import BondsView from './BondsView'
import ImportsView from './importsView'
import ReceiveView from './ReceiveView'
import SendView from './SendView'
import SettingsView from './SettingsView'
import StakesView from './StakesView'
import UnlockView from './UnlockView'

const WalletView: React.FC = (): JSX.Element => {
  const { keystoreService } = useWalletContext()

  // Important note:
  // Since `useObservableState` is set after first render
  // and Route.render is called before first render,
  // we have to add 'undefined'  as default value
  const keystore = useObservableState(keystoreService.keystore$, undefined)

  // Following routes are accessable only,
  // if an user has a phrase imported and wallet has not been locked
  const renderWalletRoutes = useMemo(
    () => (
      <Switch>
        <Route path={walletRoutes.base.template} exact>
          <Redirect to={walletRoutes.assets.path()} />
        </Route>
        <Route path={walletRoutes.settings.template} exact>
          <SettingsView />
        </Route>
        <Route path={walletRoutes.assets.template} exact>
          <AssetsNav />
          <AssetsView />
        </Route>
        <Route path={walletRoutes.stakes.template} exact>
          <AssetsNav />
          <StakesView />
        </Route>
        <Route path={walletRoutes.bonds.template} exact>
          <AssetsNav />
          <BondsView />
        </Route>
        <Route path={walletRoutes.fundsReceive.template} exact>
          <ReceiveView />
        </Route>
        <Route path={walletRoutes.fundsSend.template} exact>
          <SendView />
        </Route>
        <Route path={walletRoutes.assetDetails.template} exact>
          <AssetDetailsView />
        </Route>
      </Switch>
    ),
    []
  )

  const renderWalletRoute = useCallback(
    // Redirect if  an user has not a phrase imported or wallet has been locked
    ({ location }: { location: H.Location }) => {
      // Special case: keystore can be `undefined` (see comment at its definition using `useObservableState`)
      if (keystore === undefined) {
        return React.Fragment
      }

      if (!hasImportedKeystore(keystore)) {
        return (
          <Redirect
            to={{
              pathname: walletRoutes.imports.path(),
              state: { from: location } as RedirectRouteState
            }}
          />
        )
      }

      // check lock status
      if (isLocked(keystore)) {
        return (
          <Redirect
            to={{
              pathname: walletRoutes.locked.path(),
              state: { from: location } as RedirectRouteState
            }}
          />
        )
      }

      return renderWalletRoutes
    },
    [renderWalletRoutes, keystore]
  )

  return (
    <View>
      <Switch>
        <Route path={walletRoutes.locked.template} exact>
          <UnlockView />
        </Route>
        <Route path={walletRoutes.imports.template} exact>
          <div style={{ display: 'flex' }}>
            <ImportsView />
          </div>
        </Route>
        <Route path={walletRoutes.base.template} render={renderWalletRoute} />
      </Switch>
    </View>
  )
}

export default WalletView
