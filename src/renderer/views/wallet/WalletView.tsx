import React, { useCallback, useMemo } from 'react'

import { Row } from 'antd'
import { useObservableState } from 'observable-hooks'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'

import { RefreshButton } from '../../components/uielements/button/'
import { AssetsNav } from '../../components/wallet/assets'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { useThorchainContext } from '../../contexts/ThorchainContext'
import { useWalletContext } from '../../contexts/WalletContext'
import { triggerStream } from '../../helpers/stateHelper'
import * as walletRoutes from '../../routes/wallet'
import { hasImportedKeystore, isLocked } from '../../services/wallet/util'
import { AssetDetailsView } from './AssetDetailsView'
import { AssetsView } from './AssetsView'
import { BondsView } from './BondsView'
import { CreateView } from './CreateView'
import { ImportsView } from './importsView'
import { InteractView } from './Interact'
import { NoWalletView } from './NoWalletView'
import { PoolShareView } from './PoolShareView'
import { SendView } from './send'
import { UnlockView } from './UnlockView'
import { UpgradeView } from './upgrade'
import { WalletSettingsView } from './WalletSettingsView'
import * as Styled from './WalletView.styles'

export const WalletView: React.FC = (): JSX.Element => {
  const { keystoreService, reloadBalances } = useWalletContext()
  const {
    service: {
      shares: { reloadAllSharesByAddresses },
      pools: { reloadAllPools }
    }
  } = useMidgardContext()
  const { reloadNodesInfo } = useThorchainContext()

  const reloadHistory = triggerStream()
  const location = useLocation()

  // Important note:
  // DON'T set `INITIAL_KEYSTORE_STATE` as default value
  // Since `useObservableState` is set after first render (but not before)
  // and Route.render is called before first render,
  // we have to add 'undefined'  as default value
  const keystore = useObservableState(keystoreService.keystore$, undefined)

  const reloadButton = useCallback(
    (onClickHandler, disabled = false) => (
      <Row justify="end" style={{ marginBottom: '20px' }}>
        <RefreshButton clickHandler={onClickHandler} disabled={disabled} />
      </Row>
    ),
    []
  )

  // Following routes are accessable only,
  // if an user has a phrase imported and wallet has not been locked
  const renderWalletRoutes = useMemo(
    () => (
      <>
        <Routes>
          <Route path={walletRoutes.base.template}>
            <Navigate to={walletRoutes.assets.path()} replace />
          </Route>
          <Route path={walletRoutes.assets.template}>
            {reloadButton(() => {
              reloadAllPools()
              reloadBalances()
            })}
            <AssetsNav />
            <AssetsView />
          </Route>
          <Route path={walletRoutes.poolShares.template}>
            {reloadButton(() => {
              reloadAllSharesByAddresses()
              reloadAllPools()
            })}
            <AssetsNav />
            <PoolShareView />
          </Route>
          <Route path={walletRoutes.interact.template}>
            <InteractView />
          </Route>
          <Route path={walletRoutes.bonds.template}>
            {reloadButton(reloadNodesInfo)}
            <AssetsNav />
            <BondsView />
          </Route>
          <Route path={walletRoutes.send.template}>
            <SendView />
          </Route>
          <Route path={walletRoutes.upgradeRune.template}>
            <UpgradeView />
          </Route>
          <Route path={walletRoutes.assetDetail.template}>
            <AssetDetailsView />
          </Route>
          <Route path={walletRoutes.walletSettings.template}>
            <Styled.WalletSettingsWrapper>
              <AssetsNav />
              <WalletSettingsView />
            </Styled.WalletSettingsWrapper>
          </Route>
          <Route path={walletRoutes.history.template}>
            {reloadButton(reloadHistory.trigger)}
            <AssetsNav />
            <Styled.WalletHistoryView reloadHistory={reloadHistory} />
          </Route>
        </Routes>
      </>
    ),
    [reloadButton, reloadBalances, reloadNodesInfo, reloadHistory, reloadAllSharesByAddresses, reloadAllPools]
  )

  const renderWalletRoute = useMemo(() => {
    // Redirect if  an user has not a phrase imported or wallet has been locked
    // Special case: keystore can be `undefined` (see comment at its definition using `useObservableState`)
    if (keystore === undefined) {
      return React.Fragment
    }

    if (!hasImportedKeystore(keystore)) {
      return (
        <Navigate
          to={{
            pathname: walletRoutes.noWallet.path()
          }}
          replace
        />
      )
    }

    // check lock status
    if (isLocked(keystore)) {
      return (
        <Navigate
          to={{
            pathname: walletRoutes.locked.path(),
            search: location.search
          }}
          state={{ referrer: location.pathname }}
          replace
        />
      )
    }

    return renderWalletRoutes
  }, [keystore, renderWalletRoutes, location.search, location.pathname])

  return (
    <Routes>
      <Route path={walletRoutes.noWallet.template}>
        <NoWalletView />
      </Route>
      <Route path={walletRoutes.create.base.template}>
        <CreateView />
      </Route>
      <Route path={walletRoutes.locked.template}>
        <UnlockView />
      </Route>
      <Route path={walletRoutes.imports.base.template}>
        <ImportsView />
      </Route>
      <Route path={walletRoutes.base.template} element={renderWalletRoute} />
    </Routes>
  )
}
