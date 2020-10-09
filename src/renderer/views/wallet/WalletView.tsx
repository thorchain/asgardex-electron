import React, { useCallback, useMemo } from 'react'

import { Row } from 'antd'
import * as H from 'history'
import { useObservableState } from 'observable-hooks'
import { Switch, Route, Redirect } from 'react-router-dom'

import { RefreshButton } from '../../components/uielements/button/'
import AssetsNav from '../../components/wallet/assets/AssetsNav'
import { useWalletContext } from '../../contexts/WalletContext'
import { RedirectRouteState } from '../../routes/types'
import * as walletRoutes from '../../routes/wallet'
import { hasImportedKeystore, isLocked } from '../../services/wallet/util'
import AssetDetailsView from './AssetDetailsView'
import AssetsView from './AssetsView'
import BondsView from './BondsView'
import CreateView from './CreateView'
import FreezeView from './FreezeView'
import ImportsView from './importsView'
import NoWalletView from './NoWalletView'
import ReceiveView from './ReceiveView'
import SendView from './send/SendView'
import SettingsView from './SettingsView'
import StakesView from './StakesView'
import UnlockView from './UnlockView'

const WalletView: React.FC = (): JSX.Element => {
  const { keystoreService, reloadBalances } = useWalletContext()

  // Important note:
  // DON'T set `INITIAL_KEYSTORE_STATE` as default value
  // Since `useObservableState` is set after first render (but not before)
  // and Route.render is called before first render,
  // we have to add 'undefined'  as default value
  const keystore = useObservableState(keystoreService.keystore$, undefined)

  const reloadButton = useCallback(
    (onClickHandler) => (
      <Row justify="end" style={{ marginBottom: '20px' }}>
        <RefreshButton clickHandler={onClickHandler} />
      </Row>
    ),
    []
  )

  // Following routes are accessable only,
  // if an user has a phrase imported and wallet has not been locked
  const renderWalletRoutes = useMemo(
    () => (
      <>
        <Switch>
          <Route path={walletRoutes.base.template} exact>
            <Redirect to={walletRoutes.assets.path()} />
          </Route>
          <Route path={walletRoutes.settings.template} exact>
            <SettingsView />
          </Route>
          <Route path={walletRoutes.assets.template} exact>
            {reloadButton(reloadBalances)}
            <AssetsNav />
            <AssetsView />
          </Route>
          <Route path={walletRoutes.stakes.template} exact>
            {reloadButton(reloadBalances)}
            <AssetsNav />
            <StakesView />
          </Route>
          <Route path={walletRoutes.bonds.template} exact>
            {reloadButton(reloadBalances)}
            <AssetsNav />
            <BondsView />
          </Route>
          <Route path={walletRoutes.receive.template} exact>
            <ReceiveView />
          </Route>
          <Route path={walletRoutes.send.template} exact>
            <SendView />
          </Route>
          <Route path={walletRoutes.freeze.template} exact>
            <FreezeView freezeAction="freeze" />
          </Route>
          <Route path={walletRoutes.unfreeze.template} exact>
            <FreezeView freezeAction="unfreeze" />
          </Route>
          <Route path={walletRoutes.assetDetail.template} exact>
            <AssetDetailsView />
          </Route>
        </Switch>
      </>
    ),
    [reloadBalances, reloadButton]
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
              pathname: walletRoutes.noWallet.path()
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
    <Switch>
      <Route path={walletRoutes.noWallet.template} exact>
        <NoWalletView />
      </Route>
      <Route path={walletRoutes.create.base.template}>
        <CreateView />
      </Route>
      <Route path={walletRoutes.locked.template} exact>
        <UnlockView />
      </Route>
      <Route path={walletRoutes.imports.template} exact>
        <ImportsView />
      </Route>
      <Route path={walletRoutes.base.template} render={renderWalletRoute} />
    </Switch>
  )
}

export default WalletView
