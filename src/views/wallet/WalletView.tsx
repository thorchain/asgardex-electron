import React from 'react'
import { Switch, Route, Redirect, Link } from 'react-router-dom'

import * as walletRoutes from '../../routes/wallet'

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
          <Link to={walletRoutes.assets.path()}>Assets</Link>
        </Menu.Item>
        <Menu.Item key={1}>
          <Link to={walletRoutes.stakes.path()}>Stakes</Link>
        </Menu.Item>
        <Menu.Item key={2}>
          <Link to={walletRoutes.bonds.path()}>Bonds</Link>
        </Menu.Item>
      </Menu>
      <Switch>
        <Route path={walletRoutes.base.template} exact>
          <Redirect to={walletRoutes.assets.path()} />
        </Route>
        <Route path={walletRoutes.assets.template} exact>
          <UserAssetsScreen />
        </Route>
        <Route path={walletRoutes.stakes.template} exact>
          <UserStakesScreen />
        </Route>
        <Route path={walletRoutes.bonds.template} exact>
          <UserBondsScreen />
        </Route>
        <Route path={walletRoutes.assetDetails.template} exact>
          <UserAssetDetailsScreen />
        </Route>
      </Switch>
    </View>
  )
}

export default WalletView
