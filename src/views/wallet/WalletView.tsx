import React, { useCallback, useMemo, useState, useEffect } from 'react'

import { none } from 'fp-ts/lib/Option'
import * as H from 'history'
import { useObservableState } from 'observable-hooks'
import { Switch, Route, Redirect } from 'react-router-dom'

import { useWalletContext } from '../../contexts/WalletContext'
import { RedirectRouteState } from '../../routes/types'
import * as walletRoutes from '../../routes/wallet'
import { hasImportedKeystore, isLocked } from '../../services/wallet/util'
import View from '../View'
import FundsReceiveScreen from './FundsReceiveScreen'
import FundsSendScreen from './FundsSendScreen'
import ImportsView from './ImportsView'
import LockView from './LockView'
import UserAssetDetailsScreen from './UserAssetDetailsScreen'
import UserAssetsScreen from './UserAssetsScreen'
import UserBondsScreen from './UserBondsScreen'
import UserStakesScreen from './UserStakesScreen'
import WalletSettingsScreen from './WalletSettingsScreen'
import WalletViewNav from './WalletViewNav'

enum NextView {
  IMPORT_VIEW,
  LOCK_VIEW,
  OTHER_VIEW,
  NONE
}

const WalletView: React.FC = (): JSX.Element => {
  const { keystoreService } = useWalletContext()
  const keystore = useObservableState(keystoreService.keystore$, none)

  const [nextView, setNextView] = useState(NextView.NONE)

  const _updateView = useEffect(() => {
    const keyStoreFileExists = hasImportedKeystore(keystore)
    console.log('XXX useSubscription keyStoreFileExists', keyStoreFileExists)
    const locked = isLocked(keystore)
    console.log('XXX useSubscription isLocked', locked)

    if (!keyStoreFileExists) {
      console.log('XXX set IMPORT_VIEW')
      setNextView(NextView.IMPORT_VIEW)
    } else if (locked) {
      console.log('XXX set LOCK_VIEW')
      setNextView(NextView.LOCK_VIEW)
    } else {
      console.log('XXX set OTHER_VIEW')
      setNextView(NextView.OTHER_VIEW)
    }
  }, [keystore])

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
    ),
    []
  )

  const renderWalletRoute = useCallback(
    // Redirect if  an user has not a phrase imported or wallet has been locked
    ({ location }: { location: H.Location }) => {
      if (nextView === NextView.NONE) return React.Fragment

      console.log('location:', location)

      if (nextView === NextView.IMPORT_VIEW) {
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
      if (nextView === NextView.LOCK_VIEW) {
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
    [nextView, renderWalletRoutes]
  )

  return (
    <View>
      <div>nextView: {nextView}</div>
      <Switch>
        <Route path={walletRoutes.locked.template} exact>
          <LockView />
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
