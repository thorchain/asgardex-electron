import React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import WalletViewNav from './WalletViewNav'

import {
  walletSettingsRoute,
  walletBondsRoute,
  walletStakesRoute,
  walletAssetsRoute,
  walletAssetDetailsRoute,
  walletHomeRoute
} from '../../routes'

import View from '../View'
import WalletSettingsScreen from './WalletSettingsScreen'
import UserAssetsScreen from './UserAssetsScreen'
import UserStakesScreen from './UserStakesScreen'
import UserBondsScreen from './UserBondsScreen'
import UserAssetDetailsScreen from './UserAssetDetailsScreen'

const WalletView: React.FC = (): JSX.Element => {
  return (
    <View>
      <Switch>
        <Route path={walletHomeRoute.template} exact>
          <Redirect to={walletAssetsRoute.path()} />
        </Route>
        <Route path={walletSettingsRoute.template} exact>
          <WalletSettingsScreen />
        </Route>
        <Route path={walletAssetsRoute.template} exact>
          <WalletViewNav />
          <UserAssetsScreen />
        </Route>
        <Route path={walletStakesRoute.template} exact>
          <WalletViewNav />
          <UserStakesScreen />
        </Route>
        <Route path={walletBondsRoute.template} exact>
          <WalletViewNav />
          <UserBondsScreen />
        </Route>
        <Route path={walletAssetDetailsRoute.template} exact>
          <UserAssetDetailsScreen />
        </Route>
      </Switch>
    </View>
  )
}

export default WalletView
