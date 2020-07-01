import React, { useCallback, useMemo } from 'react'

import * as H from 'history'
import { useObservableState } from 'observable-hooks'
import { Switch, Route, Redirect } from 'react-router-dom'

import { useWalletContext } from '../../contexts/WalletContext'
import { RedirectRouteState } from '../../routes/types'
import * as walletRoutes from '../../routes/wallet'
import { hasImportedKeystore, isLocked } from '../../services/wallet/util'
import View from '../View'
import AssetsView from './AssetsView'
import BondsView from './BondsView'
import FundsReceiveScreen from './FundsReceiveScreen'
import FundsSendScreen from './FundsSendScreen'
import ImportsView from './ImportsView'
import StakesView from './StakesView'
import UnlockView from './UnlockView'
import UserAssetDetailsScreen from './UserAssetDetailsScreen'
import WalletSettingsScreen from './WalletSettingsScreen'
import WalletViewNav from './WalletViewNav'

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
          <WalletSettingsScreen />
        </Route>
        <Route path={walletRoutes.assets.template} exact>
          <WalletViewNav />
          <AssetsView />
        </Route>
        <Route path={walletRoutes.stakes.template} exact>
          <WalletViewNav />
          <StakesView />
        </Route>
        <Route path={walletRoutes.bonds.template} exact>
          <WalletViewNav />
          <BondsView />
        </Route>
        <Route path={walletRoutes.fundsReceive.template} exact>
          <FundsReceiveScreen />
        </Route>
        <Route path={walletRoutes.fundsSend.template} exact>
          <FundsSendScreen />
        </Route>
        <Route path={walletRoutes.assetDetails.template} exact>
          <UserAssetDetailsScreen />
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
          <ImportsView />
        </Route>
        <Route path={walletRoutes.base.template} render={renderWalletRoute} />
      </Switch>
    </View>
  )
}

export default WalletView
