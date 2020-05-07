import React from 'react'
import { Switch, Route, Redirect, Link } from "react-router-dom";

import { walletAssetsRoute, walletHomeRoute } from '../../routes'

import View from '../View'
import UserAssetsScreen from './UserAssetsScreen'
import { Menu } from 'antd';

const WalletView: React.FC = (): JSX.Element => {
  return (
    <View>
      <Menu mode="horizontal">
        <Menu.Item key={0}>
          <Link to={walletAssetsRoute.path()}>Assets</Link>
        </Menu.Item>
      </Menu>
      <Switch>
        <Route path={walletHomeRoute.template} exact>
          <Redirect to={walletAssetsRoute.path()} />
        </Route>
        <Route path={walletAssetsRoute.template} exact>
          <UserAssetsScreen />
        </Route>
      </Switch>
    </View>
  )
}

export default WalletView
