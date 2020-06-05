import React from 'react'

import { Switch, Route, Redirect } from 'react-router-dom'

import * as walletRoutes from '../../routes/wallet'
import FundsReceiveScreen from './FundsReceiveScreen'
import FundsSendScreen from './FundsSendScreen'
import ImportsView from './ImportsView'
import UserAssetDetailsScreen from './UserAssetDetailsScreen'
import UserAssetsScreen from './UserAssetsScreen'
import UserBondsScreen from './UserBondsScreen'
import UserStakesScreen from './UserStakesScreen'
import WalletSettingsScreen from './WalletSettingsScreen'
import WalletViewNav from './WalletViewNav'

const WalletView: React.FC = (): JSX.Element => {
  return (
    <Switch>
      <Route path={walletRoutes.base.template} exact>
        <Redirect to={walletRoutes.imports.path()} />
      </Route>
      <Route path={walletRoutes.imports.template} exact>
        <ImportsView />
      </Route>
      <Route path={walletRoutes.settings.template} exact>
        <WalletSettingsScreen />
      </Route>
      <Route path={walletRoutes.assets.template} exact>
        <WalletViewNav />
        <UserAssetsScreen />
      </Route>
      <Route path={walletRoutes.stakes.template} exact>
        <WalletViewNav />
        <UserStakesScreen />
      </Route>
      <Route path={walletRoutes.bonds.template} exact>
        <WalletViewNav />
        <UserBondsScreen />
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
  )
}

export default WalletView
