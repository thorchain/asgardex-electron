import React from 'react'
import { Switch, Route, Redirect, Link } from 'react-router-dom'

import {
  walletBondsRoute,
  walletStakesRoute,
  walletAssetsRoute,
  walletAssetDetailsRoute,
  walletHomeRoute
} from '../../routes'

import View from '../View'
import UserAssetsScreen from './UserAssetsScreen'
import UserStakesScreen from './UserStakesScreen'
import UserBondsScreen from './UserBondsScreen'
import UserAssetDetailsScreen from './UserAssetDetailsScreen'
import { Menu } from 'antd'

const WalletView: React.FC = (): JSX.Element => {
  return (
    <View>
      <Menu mode="horizontal">
        <Menu.Item key={0}>
          <Link to={walletAssetsRoute.path()}>Assets</Link>
        </Menu.Item>
        <Menu.Item key={1}>
          <Link to={walletStakesRoute.path()}>Stakes</Link>
        </Menu.Item>
        <Menu.Item key={2}>
          <Link to={walletBondsRoute.path()}>Bonds</Link>
        </Menu.Item>
      </Menu>
      <Switch>
        <Route path={walletHomeRoute.template} exact>
          <Redirect to={walletAssetsRoute.path()} />
        </Route>
        <Route path={walletAssetsRoute.template} exact>
          <UserAssetsScreen />
        </Route>
        <Route path={walletStakesRoute.template} exact>
          <UserStakesScreen />
        </Route>
        <Route path={walletBondsRoute.template} exact>
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
